import {Flags, ux} from '@oclif/core'

import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {findMatchingEnvironments, findMatchingSites, normalizeOptionalFlag, resolveEnvironment, resolveSite} from '../../../lib/kinsta-selectors.js'
import {getAllSites, getSiteEnvironments, pushEnvironment} from '../../../lib/kinsta.js'

type ResolveProgress = {
  start: (label: string) => void
  stop: () => void
}

type ResolvePushTargetIdsInput = {
  apiKey: string
  company: string
  getAllSites: typeof getAllSites
  getSiteEnvironments: typeof getSiteEnvironments
  includeEnvironmentNames?: boolean
  progress?: ResolveProgress
  site: string | undefined
  siteId: string | undefined
  sourceEnv: string | undefined
  sourceEnvId: string | undefined
  targetEnv: string | undefined
  targetEnvId: string | undefined
}

type ResolvePushTargetIdsOutput = {
  siteId: string
  sourceEnvId: string
  sourceEnvName?: string
  targetEnvId: string
  targetEnvName?: string
}

const compact = (values: Array<string | undefined>): string[] => values.filter((value): value is string => value !== undefined && value.length > 0)
const toLower = (value: string): string => value.trim().toLowerCase()
const hasMatchingId = (id: string, candidates: Array<{id: string}>): boolean => candidates.some((candidate) => toLower(candidate.id) === toLower(id))
const findById = <T extends {id: string}>(id: string, candidates: T[]): T | undefined => candidates.find((candidate) => toLower(candidate.id) === toLower(id))
const sourceEnvironmentOptions: {flagName: '--source_env'; selectionPrompt: string} = {
  flagName: '--source_env',
  selectionPrompt: 'Select the source environment to push FROM:',
}
const targetEnvironmentOptions: {flagName: '--target_env'; selectionPrompt: string} = {
  flagName: '--target_env',
  selectionPrompt: 'Select the target environment to push TO:',
}

const withProgress = async <T>(
  progress: ResolveProgress | undefined,
  label: string,
  action: () => Promise<T>,
): Promise<T> => {
  if (progress === undefined) {
    return action()
  }

  progress.start(label)
  try {
    return await action()
  } finally {
    progress.stop()
  }
}

type KinstaEnvironment = Awaited<ReturnType<typeof getSiteEnvironments>>[number]
type KinstaEnvironments = Awaited<ReturnType<typeof getSiteEnvironments>>

const resolveAllIdsPath = (siteId: string | undefined, sourceEnvId: string | undefined, targetEnvId: string | undefined): ResolvePushTargetIdsOutput | undefined => {
  if (siteId === undefined || sourceEnvId === undefined || targetEnvId === undefined) {
    return undefined
  }

  if (toLower(sourceEnvId) === toLower(targetEnvId)) {
    throw new Error('Source and target environments must be different.')
  }

  return {siteId, sourceEnvId, targetEnvId}
}

const requireCompanyId = (company: string): string => {
  const normalizedCompany = company.trim()
  if (normalizedCompany.length === 0) {
    throw new Error('Provide --company or set IROOTS_KINSTA_COMPANY_ID.')
  }

  return normalizedCompany
}

const validateSiteIdAndNameMatch = async (input: ResolvePushTargetIdsInput, siteId: string, site: string | undefined): Promise<void> => {
  const normalizedCompany = input.company.trim()
  if (site === undefined) {
    return
  }

  if (normalizedCompany.length === 0) {
    throw new Error('Provide --company when using --site together with --site_id so the values can be validated.')
  }

  const sites = await withProgress(
    input.progress,
    'Validating site selection...',
    async () => input.getAllSites(input.apiKey, normalizedCompany, false),
  )
  if (!hasMatchingId(siteId, sites)) {
    throw new Error(`No Kinsta site matched --site_id "${siteId}".`)
  }

  const matchingSites = findMatchingSites(sites, site)
  if (!matchingSites.some((matchingSite) => toLower(matchingSite.id) === toLower(siteId))) {
    throw new Error(`--site_id "${siteId}" does not match --site "${site}".`)
  }
}

const resolveSiteAndEnvironments = async (
  input: ResolvePushTargetIdsInput,
  siteId: string | undefined,
  site: string | undefined,
): Promise<{environments: KinstaEnvironments; selectedSiteId: string}> => {
  if (siteId === undefined) {
    const company = requireCompanyId(input.company)
    const sites = await withProgress(
      input.progress,
      'Fetching sites for company...',
      async () => input.getAllSites(input.apiKey, company, true),
    )
    if (sites.length === 0) {
      throw new Error(`No Kinsta sites found for company "${company}"`)
    }

    const selectedSite = await resolveSite(sites, compact([siteId, site]), site)
    const selectedSiteId = selectedSite.id
    const preloadedEnvironments = selectedSite.environments ?? []

    return {
      selectedSiteId,
      environments: preloadedEnvironments.length > 0
        ? preloadedEnvironments
        : await withProgress(
          input.progress,
          'Fetching environments for selected site...',
          async () => input.getSiteEnvironments(input.apiKey, selectedSiteId),
        ),
    }
  }

  await validateSiteIdAndNameMatch(input, siteId, site)

  return {
    selectedSiteId: siteId,
    environments: await withProgress(
      input.progress,
      'Fetching environments for selected site...',
      async () => input.getSiteEnvironments(input.apiKey, siteId),
    ),
  }
}

const validateEnvironmentIdExists = (environments: KinstaEnvironments, environmentId: string | undefined, flagName: '--source_env_id' | '--target_env_id'): void => {
  if (environmentId !== undefined && !hasMatchingId(environmentId, environments)) {
    throw new Error(`No environment matched ${flagName} "${environmentId}".`)
  }
}

const resolveSelectedEnvironment = async (
  environments: KinstaEnvironments,
  environmentId: string | undefined,
  environmentName: string | undefined,
  options: {flagName: '--source_env' | '--target_env'; selectionPrompt: string},
): Promise<KinstaEnvironment> => {
  if (environmentId === undefined) {
    return resolveEnvironment(environments, compact([environmentId, environmentName]), environmentName, options)
  }

  return findById(environmentId, environments)
    ?? resolveEnvironment(environments, compact([environmentId, environmentName]), environmentName, options)
}

const isPromptLikelyForEnvironmentResolution = (
  environments: KinstaEnvironments,
  environmentId: string | undefined,
  environmentName: string | undefined,
): boolean => {
  if (environmentId !== undefined) {
    return false
  }

  if (environmentName !== undefined) {
    return findMatchingEnvironments(environments, environmentName).length > 1
  }

  return environments.length > 0
}

type ResolveEnvironmentWithProgressInput = {
  environmentId: string | undefined
  environmentName: string | undefined
  environments: KinstaEnvironments
  label: string
  options: {flagName: '--source_env' | '--target_env'; selectionPrompt: string}
  progress: ResolveProgress | undefined
}

const resolveSelectedEnvironmentWithProgress = async (
  input: ResolveEnvironmentWithProgressInput,
): Promise<KinstaEnvironment> => {
  const {environments, environmentId, environmentName, label, options, progress} = input
  const action = async () => resolveSelectedEnvironment(environments, environmentId, environmentName, options)
  if (isPromptLikelyForEnvironmentResolution(environments, environmentId, environmentName)) {
    return action()
  }

  return withProgress(progress, label, action)
}

type EnvironmentIdNameMatchValidationInput = {
  environmentId: string | undefined
  environmentName: string | undefined
  environments: KinstaEnvironments
  idFlagName: '--source_env_id' | '--target_env_id'
  nameFlagName: '--source_env' | '--target_env'
  resolvedEnvironmentId: string
}

const validateEnvironmentIdAndNameMatch = (
  input: EnvironmentIdNameMatchValidationInput,
): void => {
  const {environments, environmentId, environmentName, idFlagName, nameFlagName, resolvedEnvironmentId} = input

  if (environmentId === undefined || environmentName === undefined) {
    return
  }

  const matchingEnvironments = findMatchingEnvironments(environments, environmentName)
  if (!matchingEnvironments.some((environment) => toLower(environment.id) === toLower(resolvedEnvironmentId))) {
    throw new Error(`${idFlagName} "${environmentId}" does not match ${nameFlagName} "${environmentName}".`)
  }
}

const buildResolveOutput = (
  includeEnvironmentNames: boolean | undefined,
  selectedSiteId: string,
  source: KinstaEnvironment,
  target: KinstaEnvironment,
): ResolvePushTargetIdsOutput => {
  if (includeEnvironmentNames === true) {
    return {
      siteId: selectedSiteId,
      sourceEnvId: source.id,
      sourceEnvName: source.display_name || source.name,
      targetEnvId: target.id,
      targetEnvName: target.display_name || target.name,
    }
  }

  return {
    siteId: selectedSiteId,
    sourceEnvId: source.id,
    targetEnvId: target.id,
  }
}

export async function resolvePushTargetIds(input: ResolvePushTargetIdsInput): Promise<ResolvePushTargetIdsOutput> {
  const siteId = normalizeOptionalFlag(input.siteId)
  const sourceEnvId = normalizeOptionalFlag(input.sourceEnvId)
  const targetEnvId = normalizeOptionalFlag(input.targetEnvId)
  const site = normalizeOptionalFlag(input.site)
  const sourceEnv = normalizeOptionalFlag(input.sourceEnv)
  const targetEnv = normalizeOptionalFlag(input.targetEnv)

  const allIdsResult = resolveAllIdsPath(siteId, sourceEnvId, targetEnvId)
  if (allIdsResult !== undefined) {
    return allIdsResult
  }

  const {selectedSiteId, environments} = await resolveSiteAndEnvironments(input, siteId, site)

  validateEnvironmentIdExists(environments, sourceEnvId, '--source_env_id')
  validateEnvironmentIdExists(environments, targetEnvId, '--target_env_id')

  const source = await resolveSelectedEnvironmentWithProgress({
    progress: input.progress,
    label: 'Resolving source environment...',
    environments,
    environmentId: sourceEnvId,
    environmentName: sourceEnv,
    options: sourceEnvironmentOptions,
  })
  const target = await resolveSelectedEnvironmentWithProgress({
    progress: input.progress,
    label: 'Resolving target environment...',
    environments,
    environmentId: targetEnvId,
    environmentName: targetEnv,
    options: targetEnvironmentOptions,
  })

  validateEnvironmentIdAndNameMatch({
    environments,
    environmentId: sourceEnvId,
    environmentName: sourceEnv,
    idFlagName: '--source_env_id',
    nameFlagName: '--source_env',
    resolvedEnvironmentId: source.id,
  })
  validateEnvironmentIdAndNameMatch({
    environments,
    environmentId: targetEnvId,
    environmentName: targetEnv,
    idFlagName: '--target_env_id',
    nameFlagName: '--target_env',
    resolvedEnvironmentId: target.id,
  })

  if (source.id === target.id) {
    throw new Error('Source and target environments must be different.')
  }

  return buildResolveOutput(input.includeEnvironmentNames, selectedSiteId, source, target)
}

export default class Push extends KinstaCommand {
  static description = 'Push an existing environment'
  static flags = {
    company: Flags.string({
      env: 'IROOTS_KINSTA_COMPANY_ID',
      required: false,
    }),
    site: Flags.string({
      required: false,
    }),
    // eslint-disable-next-line camelcase
    site_id: Flags.string({
      required: false,
    }),
    // eslint-disable-next-line camelcase
    source_env: Flags.string({
      required: false,
    }),
    // eslint-disable-next-line camelcase
    source_env_id: Flags.string({
      required: false,
    }),
    // eslint-disable-next-line camelcase
    target_env: Flags.string({
      required: false,
    }),
    // eslint-disable-next-line camelcase
    target_env_id: Flags.string({
      required: false,
    }),
    // eslint-disable-next-line camelcase
    push_db: Flags.boolean({
      allowNo: true,
      default: true,
    }),
    // eslint-disable-next-line camelcase
    push_files: Flags.boolean({
      allowNo: true,
      default: true,
    }),
    // eslint-disable-next-line camelcase
    push_files_option: Flags.string({
      default: 'ALL_FILES',
      options: ['ALL_FILES', 'SPECIFIC_FILES'],
    }),
    // eslint-disable-next-line camelcase
    file_list: Flags.string({
      multiple: true,
      relationships: [
        {
          type: 'all',
          flags: [
            {
              name: 'push_files_option',
              when: async (flags) => flags.push_files_option === 'SPECIFIC_FILES',
            }
          ],
        }
      ],
    }),
    // eslint-disable-next-line camelcase
    search_and_replace: Flags.boolean({
      allowNo: true,
      default: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Push)

    const siteIdFlag = normalizeOptionalFlag(flags.site_id)
    const sourceEnvIdFlag = normalizeOptionalFlag(flags.source_env_id)
    const targetEnvIdFlag = normalizeOptionalFlag(flags.target_env_id)

    let resolvedIds: ResolvePushTargetIdsOutput

    try {
      resolvedIds = await resolvePushTargetIds({
        apiKey: flags.apiKey,
        company: normalizeOptionalFlag(flags.company) ?? '',
        getAllSites,
        getSiteEnvironments,
        includeEnvironmentNames: true,
        site: flags.site,
        siteId: siteIdFlag,
        sourceEnv: flags.source_env,
        sourceEnvId: sourceEnvIdFlag,
        targetEnv: flags.target_env,
        targetEnvId: targetEnvIdFlag,
        progress: {
          start(label: string) {
            ux.action.start(label)
          },
          stop() {
            ux.action.stop()
          },
        },
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      this.error(message)
    }

    let sourceEnvName = resolvedIds.sourceEnvName ?? resolvedIds.sourceEnvId
    let targetEnvName = resolvedIds.targetEnvName ?? resolvedIds.targetEnvId

    if (resolvedIds.sourceEnvName === undefined || resolvedIds.targetEnvName === undefined) {
      const environments = await getSiteEnvironments(flags.apiKey, resolvedIds.siteId)
      sourceEnvName = environments.find((environment) => environment.id === resolvedIds.sourceEnvId)?.display_name ?? sourceEnvName
      targetEnvName = environments.find((environment) => environment.id === resolvedIds.targetEnvId)?.display_name ?? targetEnvName
    }

    ux.action.start(`Pushing environment "${sourceEnvName}" to "${targetEnvName}"`)

    /* eslint-disable camelcase */
    const response = await pushEnvironment(flags.apiKey, resolvedIds.siteId, {
      file_list: flags.file_list,
      push_db: flags.push_db,
      push_files: flags.push_files,
      push_files_option: flags.push_files_option,
      search_and_replace: flags.search_and_replace,
      source_env_id: resolvedIds.sourceEnvId,
      target_env_id: resolvedIds.targetEnvId,
    })
    /* eslint-enable camelcase */

    ux.action.stop(response.message)
  }
}

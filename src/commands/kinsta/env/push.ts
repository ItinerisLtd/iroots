import {Flags, ux} from '@oclif/core'

import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {findMatchingEnvironments, findMatchingSites, normalizeOptionalFlag, resolveEnvironment, resolveSite} from '../../../lib/kinsta-selectors.js'
import {getAllSites, getSiteEnvironments, pushEnvironment} from '../../../lib/kinsta.js'

type ResolvePushTargetIdsInput = {
  apiKey: string
  company: string
  getAllSites: typeof getAllSites
  getSiteEnvironments: typeof getSiteEnvironments
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
  targetEnvId: string
}

const compact = (values: Array<string | undefined>): string[] => values.filter((value): value is string => value !== undefined && value.length > 0)
const toLower = (value: string): string => value.trim().toLowerCase()
const hasMatchingId = (id: string, candidates: Array<{id: string}>): boolean => candidates.some((candidate) => toLower(candidate.id) === toLower(id))
const findById = <T extends {id: string}>(id: string, candidates: T[]): T | undefined => candidates.find((candidate) => toLower(candidate.id) === toLower(id))

export async function resolvePushTargetIds(input: ResolvePushTargetIdsInput): Promise<ResolvePushTargetIdsOutput> {
  const siteId = normalizeOptionalFlag(input.siteId)
  const sourceEnvId = normalizeOptionalFlag(input.sourceEnvId)
  const targetEnvId = normalizeOptionalFlag(input.targetEnvId)
  const site = normalizeOptionalFlag(input.site)
  const sourceEnv = normalizeOptionalFlag(input.sourceEnv)
  const targetEnv = normalizeOptionalFlag(input.targetEnv)

  const hasAllIds = siteId !== undefined && sourceEnvId !== undefined && targetEnvId !== undefined
  if (hasAllIds) {
    if (sourceEnvId === targetEnvId) {
      throw new Error('Source and target environments must be different.')
    }

    return {siteId, sourceEnvId, targetEnvId}
  }

  let selectedSiteId: string
  let environments: Awaited<ReturnType<typeof getSiteEnvironments>>

  if (siteId === undefined) {
    const normalizedCompany = input.company.trim()
    if (normalizedCompany.length === 0) {
      throw new Error('Provide --company or set IROOTS_KINSTA_COMPANY_ID.')
    }

    const sites = await input.getAllSites(input.apiKey, normalizedCompany, true)
    const selectedSite = await resolveSite(sites, compact([siteId, site]), site)

    selectedSiteId = selectedSite.id
    const preloadedEnvironments = selectedSite.environments ?? []
    environments = preloadedEnvironments.length > 0
      ? preloadedEnvironments
      : await input.getSiteEnvironments(input.apiKey, selectedSiteId)
  } else {
    selectedSiteId = siteId
    const normalizedCompany = input.company.trim()
    if (site !== undefined && normalizedCompany.length > 0) {
      const sites = await input.getAllSites(input.apiKey, normalizedCompany, true)
      if (!hasMatchingId(siteId, sites)) {
        throw new Error(`No Kinsta site matched --site_id "${siteId}".`)
      }

      const matchingSites = findMatchingSites(sites, site)
      if (!matchingSites.some((matchingSite) => toLower(matchingSite.id) === toLower(siteId))) {
        throw new Error(`--site_id "${siteId}" does not match --site "${site}".`)
      }
    }

    environments = await input.getSiteEnvironments(input.apiKey, selectedSiteId)
  }

  if (sourceEnvId !== undefined && !hasMatchingId(sourceEnvId, environments)) {
    throw new Error(`No environment matched --source_env_id "${sourceEnvId}".`)
  }

  if (targetEnvId !== undefined && !hasMatchingId(targetEnvId, environments)) {
    throw new Error(`No environment matched --target_env_id "${targetEnvId}".`)
  }

  const source = sourceEnvId === undefined
    ? await resolveEnvironment(environments, compact([sourceEnvId, sourceEnv]), sourceEnv, {
      flagName: '--source_env',
      selectionPrompt: 'Select the source environment to push FROM:',
    })
    : findById(sourceEnvId, environments) ?? await resolveEnvironment(environments, compact([sourceEnvId, sourceEnv]), sourceEnv, {
      flagName: '--source_env',
      selectionPrompt: 'Select the source environment to push FROM:',
    })
  const target = targetEnvId === undefined
    ? await resolveEnvironment(environments, compact([targetEnvId, targetEnv]), targetEnv, {
      flagName: '--target_env',
      selectionPrompt: 'Select the target environment to push TO:',
    })
    : findById(targetEnvId, environments) ?? await resolveEnvironment(environments, compact([targetEnvId, targetEnv]), targetEnv, {
      flagName: '--target_env',
      selectionPrompt: 'Select the target environment to push TO:',
    })

  if (sourceEnvId !== undefined && sourceEnv !== undefined) {
    const matchingEnvironments = findMatchingEnvironments(environments, sourceEnv)
    if (!matchingEnvironments.some((environment) => toLower(environment.id) === toLower(source.id))) {
      throw new Error(`--source_env_id "${sourceEnvId}" does not match --source_env "${sourceEnv}".`)
    }
  }

  if (targetEnvId !== undefined && targetEnv !== undefined) {
    const matchingEnvironments = findMatchingEnvironments(environments, targetEnv)
    if (!matchingEnvironments.some((environment) => toLower(environment.id) === toLower(target.id))) {
      throw new Error(`--target_env_id "${targetEnvId}" does not match --target_env "${targetEnv}".`)
    }
  }

  if (source.id === target.id) {
    throw new Error('Source and target environments must be different.')
  }

  return {siteId: selectedSiteId, sourceEnvId: source.id, targetEnvId: target.id}
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
        site: flags.site,
        siteId: siteIdFlag,
        sourceEnv: flags.source_env,
        sourceEnvId: sourceEnvIdFlag,
        targetEnv: flags.target_env,
        targetEnvId: targetEnvIdFlag,
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      this.error(message)
    }

    const environments = await getSiteEnvironments(flags.apiKey, resolvedIds.siteId)
    const sourceEnvName = environments.find((environment) => environment.id === resolvedIds.sourceEnvId)?.display_name ?? resolvedIds.sourceEnvId
    const targetEnvName = environments.find((environment) => environment.id === resolvedIds.targetEnvId)?.display_name ?? resolvedIds.targetEnvId

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

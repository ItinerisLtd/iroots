import {Flags, ux} from '@oclif/core'

import {KinstaCommand} from '../../../../lib/commands/kinsta-command.js'
import {findMatchingSites, normalizeOptionalFlag, resolveEnvironment, resolveSite} from '../../../../lib/kinsta-selectors.js'
import {getAllSites, getLogs, getSiteEnvironments, KINSTA_LOG_FILE_NAMES, KinstaLogFileName} from '../../../../lib/kinsta.js'
import {inferKinstaFromTrellis} from '../../../../lib/trellis-kinsta.js'
import {isPromptLikelyForEnvironmentResolution} from '../push.js'

type ResolveProgress = {
  start: (label: string) => void
  stop: (status?: string) => void
}

type ResolveLogsEnvironmentIdInput = {
  apiKey: string
  company: string | undefined
  environment: string | undefined
  environmentId: string | undefined
  getAllSites: typeof getAllSites
  getSiteEnvironments: typeof getSiteEnvironments
  progress?: ResolveProgress
  site: string | undefined
  siteId: string | undefined
  siteNameCandidates?: string[]
}

const toLower = (value: string): string => value.trim().toLowerCase()
const hasMatchingId = (id: string, candidates: Array<{id: string}>): boolean => candidates.some((candidate) => toLower(candidate.id) === toLower(id))

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
    const result = await action()
    progress.stop()
    return result
  } catch (error: unknown) {
    progress.stop('failed')
    throw error
  }
}

const validateSiteIdAndNameMatch = async (input: ResolveLogsEnvironmentIdInput, siteId: string, site: string | undefined): Promise<void> => {
  const company = normalizeOptionalFlag(input.company)
  if (site === undefined) {
    return
  }

  if (company === undefined) {
    throw new Error('Provide --company when using --site together with --site_id so the values can be validated.')
  }

  const sites = await withProgress(
    input.progress,
    'Validating site selection...',
    async () => input.getAllSites(input.apiKey, company, false),
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
  input: ResolveLogsEnvironmentIdInput,
  siteId: string | undefined,
  site: string | undefined,
): Promise<Awaited<ReturnType<typeof getSiteEnvironments>>> => {
  if (siteId !== undefined) {
    await validateSiteIdAndNameMatch(input, siteId, site)

    return withProgress(
      input.progress,
      'Fetching environments for selected site...',
      async () => input.getSiteEnvironments(input.apiKey, siteId),
    )
  }

  const company = normalizeOptionalFlag(input.company)
  if (company === undefined) {
    throw new Error('Could not resolve --environment_id directly. Provide --company or set IROOTS_KINSTA_COMPANY_ID.')
  }

  const sites = await withProgress(
    input.progress,
    'Fetching sites for company...',
    async () => input.getAllSites(input.apiKey, company, true),
  )
  if (sites.length === 0) {
    throw new Error(`No Kinsta sites found for company "${company}"`)
  }

  const siteCandidates = [site, ...(input.siteNameCandidates ?? [])].filter((value): value is string => value !== undefined && value.length > 0)
  const selectedSite = await resolveSite(sites, siteCandidates, site)
  const preloadedEnvironments = selectedSite.environments ?? []

  return preloadedEnvironments.length > 0
    ? preloadedEnvironments
    : withProgress(
      input.progress,
      'Fetching environments for selected site...',
      async () => input.getSiteEnvironments(input.apiKey, selectedSite.id),
    )
}

export async function resolveLogsEnvironmentId(input: ResolveLogsEnvironmentIdInput): Promise<string> {
  const environmentId = normalizeOptionalFlag(input.environmentId)
  if (environmentId !== undefined) {
    return environmentId
  }

  const site = normalizeOptionalFlag(input.site)
  const siteId = normalizeOptionalFlag(input.siteId)
  const environment = normalizeOptionalFlag(input.environment)

  const environments = await resolveSiteAndEnvironments(input, siteId, site)
  const environmentCandidates = environment === undefined ? [] : [environment]

  const selectedEnvironment = isPromptLikelyForEnvironmentResolution(environments, undefined, environment)
    ? await resolveEnvironment(environments, environmentCandidates, environment)
    : await withProgress(
      input.progress,
      'Resolving environment...',
      async () => resolveEnvironment(environments, environmentCandidates, environment),
    )

  return selectedEnvironment.id
}

export default class Get extends KinstaCommand {
  static description = 'Fetch logs for a Kinsta environment'
  static examples = ['<%= config.bin %> <%= command.id %>']
  static flags = {
    company: Flags.string({
      description: 'Kinsta company ID (required when --environment_id is not resolved directly, or when combining --site with --site_id)',
      env: 'IROOTS_KINSTA_COMPANY_ID',
      required: false,
    }),
    environment: Flags.string({
      description: 'Environment name (case-insensitive exact match)',
      required: false,
    }),
    // eslint-disable-next-line camelcase
    environment_id: Flags.string({
      description: 'Environment ID (takes priority over inferred values)',
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
      required: false,
    }),
    // eslint-disable-next-line camelcase
    file_name: Flags.string({
      default: 'error',
      options: [...KINSTA_LOG_FILE_NAMES],
      required: true,
    }),
    format: Flags.string({
      default: 'text',
      options: ['json', 'text'],
      required: false,
    }),
    // eslint-disable-next-line camelcase
    infer_site: Flags.boolean({
      allowNo: true,
      default: true,
      description: 'Infer the site from the current directory (Trellis/Bedrock). Use --no-infer_site to always pick from the full site list.',
    }),
    lines: Flags.integer({
      default: 1000,
      max: 20_000,
      required: true,
    }),
    site: Flags.string({
      description: 'Site name (case-insensitive exact match)',
      required: false,
    }),
    // eslint-disable-next-line camelcase
    site_id: Flags.string({
      description: 'Site ID (takes priority over inferred values)',
      required: false,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Get)
    const {apiKey, file_name: fileName, format, lines} = flags

    const siteFlag = normalizeOptionalFlag(flags.site)
    const siteIdFlag = normalizeOptionalFlag(flags.site_id)
    const environmentIdFlag = normalizeOptionalFlag(flags.environment_id)

    let inference = null
    if (flags.infer_site && environmentIdFlag === undefined && siteIdFlag === undefined && siteFlag === undefined) {
      try {
        inference = await inferKinstaFromTrellis(process.cwd())
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        this.error(`Failed to infer the site from the current directory: ${message}`)
      }
    }

    let environmentId: string

    try {
      environmentId = await resolveLogsEnvironmentId({
        apiKey,
        company: flags.company,
        environment: flags.environment,
        environmentId: flags.environment_id,
        getAllSites,
        getSiteEnvironments,
        site: flags.site,
        siteId: flags.site_id,
        siteNameCandidates: inference?.siteNames,
        progress: {
          start(label: string) {
            ux.action.start(label)
          },
          stop(status?: string) {
            ux.action.stop(status)
          },
        },
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      this.error(message)
    }

    const logs = await getLogs(apiKey, environmentId, fileName as KinstaLogFileName, lines)

    if (format === 'json') {
      console.log(JSON.stringify({logs}))
    } else {
      console.log(logs)
    }
  }
}

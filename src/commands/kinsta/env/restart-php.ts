import {Flags, ux} from '@oclif/core'

import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {compact, requireCompanyId, ResolveProgress, validateSiteIdAndNameMatch, withProgress} from '../../../lib/kinsta-resolution.js'
import {normalizeOptionalFlag, resolveEnvironment, resolveSite} from '../../../lib/kinsta-selectors.js'
import {getAllSites, getSiteEnvironments, restartPhpEngine} from '../../../lib/kinsta.js'
import {inferKinstaFromTrellis} from '../../../lib/trellis-kinsta.js'
import {isPromptLikelyForEnvironmentResolution} from './push.js'

type ResolveRestartPhpEnvironmentIdInput = {
  apiKey: string
  company: string
  environment: string | undefined
  environmentId: string | undefined
  getAllSites: typeof getAllSites
  getSiteEnvironments: typeof getSiteEnvironments
  progress?: ResolveProgress
  site: string | undefined
  siteId: string | undefined
  siteNameCandidates?: string[]
}

type KinstaEnvironments = Awaited<ReturnType<typeof getSiteEnvironments>>

const resolveEnvironmentsForSite = async (
  input: ResolveRestartPhpEnvironmentIdInput,
  siteId: string | undefined,
  site: string | undefined,
): Promise<KinstaEnvironments> => {
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

    const selectedSite = await resolveSite(sites, compact([site, ...(input.siteNameCandidates ?? [])]), site)
    const preloadedEnvironments = selectedSite.environments ?? []

    return preloadedEnvironments.length > 0
      ? preloadedEnvironments
      : withProgress(
        input.progress,
        'Fetching environments for selected site...',
        async () => input.getSiteEnvironments(input.apiKey, selectedSite.id),
      )
  }

  await validateSiteIdAndNameMatch(input, siteId, site)

  return withProgress(
    input.progress,
    'Fetching environments for selected site...',
    async () => input.getSiteEnvironments(input.apiKey, siteId),
  )
}

export async function resolveRestartPhpEnvironmentId(input: ResolveRestartPhpEnvironmentIdInput): Promise<string> {
  const environmentId = normalizeOptionalFlag(input.environmentId)
  if (environmentId !== undefined) {
    return environmentId
  }

  const siteId = normalizeOptionalFlag(input.siteId)
  const site = normalizeOptionalFlag(input.site)
  const environment = normalizeOptionalFlag(input.environment)

  const environments = await resolveEnvironmentsForSite(input, siteId, site)

  const resolveAction = async () => resolveEnvironment(environments, compact([environment]), environment)
  const selectedEnvironment = isPromptLikelyForEnvironmentResolution(environments, undefined, environment)
    ? await resolveAction()
    : await withProgress(input.progress, 'Resolving environment...', resolveAction)

  return selectedEnvironment.id
}

export default class RestartPhp extends KinstaCommand {
  static description = "Restart an environment's PHP engine"
  static flags = {
    company: Flags.string({
      description: 'Kinsta company ID (required when site/environment IDs are not resolved directly)',
      env: 'IROOTS_KINSTA_COMPANY_ID',
      required: false,
    }),
    env: Flags.string({
      aliases: ['environment'],
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
    infer_site: Flags.boolean({
      allowNo: true,
      default: true,
      description: 'Infer the site from the current directory (Trellis/Bedrock). Use --no-infer_site to always pick from the full site list.',
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
    const {flags} = await this.parse(RestartPhp)
    const siteFlag = normalizeOptionalFlag(flags.site)
    const siteIdFlag = normalizeOptionalFlag(flags.site_id)
    const environmentIdFlag = normalizeOptionalFlag(flags.environment_id)

    const inference = flags.infer_site && environmentIdFlag === undefined && siteIdFlag === undefined && siteFlag === undefined
      ? await inferKinstaFromTrellis(process.cwd())
      : null

    let environmentId: string

    try {
      environmentId = await resolveRestartPhpEnvironmentId({
        apiKey: flags.apiKey,
        company: normalizeOptionalFlag(flags.company) ?? '',
        environment: flags.env,
        environmentId: environmentIdFlag,
        getAllSites,
        getSiteEnvironments,
        site: flags.site,
        siteId: siteIdFlag,
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

    ux.action.start('Restarting PHP engine')
    const response = await restartPhpEngine(flags.apiKey, environmentId)
    ux.action.stop(response.message)
  }
}

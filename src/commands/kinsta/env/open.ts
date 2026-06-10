import {select} from '@inquirer/prompts'
import {Flags, ux} from '@oclif/core'

import {openUrlInBrowser} from '../../../lib/browser.js'
import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {getAllSites, getSiteEnvironments, KinstaSite} from '../../../lib/kinsta.js'
import {inferKinstaFromTrellis} from '../../../lib/trellis-kinsta.js'

type KinstaEnvironment = Awaited<ReturnType<typeof getSiteEnvironments>>[number]

export default class Open extends KinstaCommand {
  static description = 'Open a Kinsta environment in your default web browser'
  static examples = ['<%= config.bin %> <%= command.id %>']
  static flags = {
    company: Flags.string({
      description: 'Kinsta company ID (required when site/environment IDs are not resolved directly)',
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
    const {flags} = await this.parse(Open)
    const {apiKey} = flags
    const company = normalizeOptionalFlag(flags.company)
    const site = normalizeOptionalFlag(flags.site)
    const environment = normalizeOptionalFlag(flags.environment)
    const siteIdFlag = normalizeOptionalFlag(flags.site_id)
    const environmentIdFlag = normalizeOptionalFlag(flags.environment_id)

    if ((siteIdFlag === undefined) !== (environmentIdFlag === undefined)) {
      this.error('Provide both --site_id and --environment_id together, or provide neither.')
    }

    if (siteIdFlag !== undefined && environmentIdFlag !== undefined) {
      await this.openEnvironment(siteIdFlag, environmentIdFlag)
      return
    }

    if (company === undefined) {
      this.error('Could not resolve IDs directly. Provide --company or set IROOTS_KINSTA_COMPANY_ID.')
    }

    const inference = site === undefined ? await inferKinstaFromTrellis(process.cwd()) : null

    ux.action.start('Fetching Kinsta sites')
    const sites = await getAllSites(apiKey, company, true)
    ux.action.stop()

    if (sites.length === 0) {
      this.error(`No Kinsta sites found for company "${company}"`)
    }

    const siteCandidates = compact([
      site,
      ...(inference?.siteNames ?? []),
    ])
    const selectedSite = await resolveSite(sites, siteCandidates, site)

    const environments = selectedSite.environments ?? []
    if (environments.length === 0) {
      ux.action.start(`Fetching environments for site "${selectedSite.display_name}"`)
      environments.push(...await getSiteEnvironments(apiKey, selectedSite.id))
      ux.action.stop()
    }

    if (environments.length === 0) {
      this.error(`No environments found for site "${selectedSite.display_name}"`)
    }

    const environmentCandidates = compact([environment])
    const selectedEnvironment = await resolveEnvironment(environments, environmentCandidates, environment)

    await this.openEnvironment(selectedSite.id, selectedEnvironment.id)
  }

  private async openEnvironment(siteId: string, environmentId: string): Promise<void> {
    const url = `https://my.kinsta.com/sites/details/${encodeURIComponent(siteId)}/${encodeURIComponent(environmentId)}?`
    this.log(`URL: ${url}`)

    ux.action.start('Opening environment in browser')
    try {
      await openUrlInBrowser(url)
      ux.action.stop()
    } catch (error: unknown) {
      ux.action.stop('failed')
      const message = error instanceof Error ? error.message : String(error)
      this.error(message)
    }
  }
}

async function resolveSite(sites: KinstaSite[], candidates: string[], explicitSite: string | undefined): Promise<KinstaSite> {
  if (explicitSite !== undefined) {
    const explicitMatches = findMatchingSites(sites, explicitSite)
    if (explicitMatches.length === 0) {
      throw new Error(`No Kinsta site matched --site "${explicitSite}"`)
    }

    if (explicitMatches.length === 1) {
      return explicitMatches[0]
    }

    return promptForSite(explicitMatches, `Multiple sites matched --site "${explicitSite}". Select one:`)
  }

  for (const candidate of candidates) {
    const matches = findMatchingSites(sites, candidate)
    if (matches.length === 1) {
      return matches[0]
    }
  }

  return promptForSite(sites, 'Select a Kinsta site:')
}

async function resolveEnvironment(
  environments: KinstaEnvironment[],
  candidates: string[],
  explicitEnvironment: string | undefined,
): Promise<KinstaEnvironment> {
  if (explicitEnvironment !== undefined) {
    const explicitMatches = findMatchingEnvironments(environments, explicitEnvironment)
    if (explicitMatches.length === 0) {
      throw new Error(`No environment matched --environment "${explicitEnvironment}"`)
    }

    if (explicitMatches.length === 1) {
      return explicitMatches[0]
    }

    return promptForEnvironment(explicitMatches, `Multiple environments matched --environment "${explicitEnvironment}". Select one:`)
  }

  for (const candidate of candidates) {
    const matches = findMatchingEnvironments(environments, candidate)
    if (matches.length === 1) {
      return matches[0]
    }
  }

  return promptForEnvironment(environments, 'Select an environment:')
}

function findMatchingSites(sites: KinstaSite[], candidate: string): KinstaSite[] {
  const normalizedCandidate = normalize(candidate)

  return sites.filter(site => (
    normalize(site.id) === normalizedCandidate
    || normalize(site.name) === normalizedCandidate
    || normalize(site.display_name) === normalizedCandidate
  ))
}

function findMatchingEnvironments(environments: KinstaEnvironment[], candidate: string): KinstaEnvironment[] {
  const normalizedCandidate = normalize(candidate)

  const idMatches = environments.filter(environment => normalize(environment.id) === normalizedCandidate)
  if (idMatches.length > 0) {
    return idMatches
  }

  const displayNameMatches = environments.filter(environment => normalize(environment.display_name) === normalizedCandidate)
  if (displayNameMatches.length > 0) {
    return displayNameMatches
  }

  return environments.filter(environment => normalize(environment.name) === normalizedCandidate)
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function compact(values: Array<string | undefined>): string[] {
  return values.filter((value): value is string => value !== undefined && value.trim().length > 0)
}

function normalizeOptionalFlag(value: string | undefined): string | undefined {
  const normalized = value?.trim()
  return normalized !== undefined && normalized.length > 0 ? normalized : undefined
}

async function promptForSite(sites: KinstaSite[], message: string): Promise<KinstaSite> {
  const sortedSites = [...sites].sort((a, b) => a.display_name.localeCompare(b.display_name))

  const siteId = await select({
    message,
    choices: sortedSites.map(site => ({
      name: formatSiteChoice(site),
      value: site.id,
    })),
  })

  return sortedSites.find(site => site.id === siteId) ?? sortedSites[0]
}

function formatSiteChoice(site: KinstaSite): string {
  const environments = site.environments
    ?.map(environment => environment.display_name || environment.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b)) ?? []
  const environmentSummary = environments.length > 0
    ? ` envs: ${environments.join(', ')}`
    : ' envs: unknown'

  return `${site.display_name} (${site.name}) [${site.id}]${environmentSummary}`
}

async function promptForEnvironment(environments: KinstaEnvironment[], message: string): Promise<KinstaEnvironment> {
  const sortedEnvironments = [...environments].sort((a, b) => a.display_name.localeCompare(b.display_name))

  const environmentId = await select({
    message,
    choices: sortedEnvironments.map(environment => ({
      name: `${environment.display_name} (${environment.name}) [${environment.id}]`,
      value: environment.id,
    })),
  })

  return sortedEnvironments.find(environment => environment.id === environmentId) ?? sortedEnvironments[0]
}

import {select} from '@inquirer/prompts'

import {KinstaEnvironment, KinstaSite} from './kinsta.js'

const normalize = (value: string): string => value.trim().toLowerCase()

export function normalizeOptionalFlag(value: string | undefined): string | undefined {
  const normalized = value?.trim()
  return normalized !== undefined && normalized.length > 0 ? normalized : undefined
}

export function findMatchingSites(sites: KinstaSite[], candidate: string): KinstaSite[] {
  const normalizedCandidate = normalize(candidate)
  return sites.filter(site => (
    normalize(site.id) === normalizedCandidate
    || normalize(site.name) === normalizedCandidate
    || normalize(site.display_name) === normalizedCandidate
  ))
}

export function findMatchingEnvironments(environments: KinstaEnvironment[], candidate: string): KinstaEnvironment[] {
  const normalizedCandidate = normalize(candidate)
  const idMatches = environments.filter(environment => normalize(environment.id) === normalizedCandidate)
  if (idMatches.length > 0) return idMatches
  const displayMatches = environments.filter(environment => normalize(environment.display_name) === normalizedCandidate)
  if (displayMatches.length > 0) return displayMatches
  return environments.filter(environment => normalize(environment.name) === normalizedCandidate)
}

export function formatSiteChoice(site: KinstaSite): string {
  const environmentNames = site.environments
    ?.map((environment) => environment.display_name || environment.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b)) ?? []
  const environmentSummary = environmentNames.length > 0
    ? `envs: ${environmentNames.join(', ')}`
    : 'envs: unknown'

  return `${site.display_name} (${site.name}) [${site.id}] ${environmentSummary}`
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

export async function resolveSite(sites: KinstaSite[], candidates: string[], explicitSite?: string): Promise<KinstaSite> {
  const explicit = normalizeOptionalFlag(explicitSite)
  if (explicit !== undefined) {
    const matches = findMatchingSites(sites, explicit)
    if (matches.length === 1) return matches[0]
    if (matches.length > 1) return promptForSite(matches, `Multiple sites matched --site "${explicitSite}". Select one:`)
    throw new Error(`No Kinsta site matched --site "${explicitSite}"`)
  }

  const inferredMatches = new Map<string, KinstaSite>()
  for (const c of candidates) {
    const matches = findMatchingSites(sites, c)
    for (const m of matches) inferredMatches.set(m.id, m)
  }

  const uniqueInferredMatches = [...inferredMatches.values()]
  if (uniqueInferredMatches.length === 1) return uniqueInferredMatches[0]
  if (uniqueInferredMatches.length > 1) return promptForSite(uniqueInferredMatches, 'Multiple inferred sites matched. Select a Kinsta site:')

  if (sites.length > 0) return promptForSite(sites, 'Select a Kinsta site:')
  throw new Error('No sites available')
}

type ResolveEnvironmentOptions = {
  flagName?: string
  selectionPrompt?: string
}

export async function resolveEnvironment(
  environments: KinstaEnvironment[],
  candidates: string[],
  explicitEnvironment?: string,
  options: ResolveEnvironmentOptions = {},
): Promise<KinstaEnvironment> {
  const explicit = normalizeOptionalFlag(explicitEnvironment)
  const flagName = options.flagName ?? '--environment'
  const selectionPrompt = options.selectionPrompt ?? 'Select an environment:'

  if (explicit !== undefined) {
    const matches = findMatchingEnvironments(environments, explicit)
    if (matches.length === 1) return matches[0]
    if (matches.length > 1) return promptForEnvironment(matches, `Multiple environments matched ${flagName} "${explicitEnvironment}". Select one:`)
    throw new Error(`No environment matched ${flagName} "${explicitEnvironment}"`)
  }

  for (const c of candidates) {
    const matches = findMatchingEnvironments(environments, c)
    if (matches.length === 1) return matches[0]
  }

  if (environments.length > 0) return promptForEnvironment(environments, selectionPrompt)
  throw new Error('No environments available')
}

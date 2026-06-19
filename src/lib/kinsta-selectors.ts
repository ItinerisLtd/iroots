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

export async function resolveSite(sites: KinstaSite[], candidates: string[], explicitSite?: string): Promise<KinstaSite> {
  // Reuse the matching behaviour: prefer explicitSite when provided
  const explicit = normalizeOptionalFlag(explicitSite)
  if (explicit) {
    const matches = findMatchingSites(sites, explicit)
    if (matches.length === 1) return matches[0]
    if (matches.length > 1) return matches[0]
  }

  // Try candidate list in order
  for (const c of candidates) {
    const matches = findMatchingSites(sites, c)
    if (matches.length === 1) return matches[0]
    if (matches.length > 1) return matches[0]
  }

  // Fallback to first site
  if (sites.length > 0) return sites[0]
  throw new Error('No sites available')
}

export async function resolveEnvironment(environments: KinstaEnvironment[], candidates: string[], explicitEnvironment?: string): Promise<KinstaEnvironment> {
  const explicit = normalizeOptionalFlag(explicitEnvironment)
  if (explicit) {
    const matches = findMatchingEnvironments(environments, explicit)
    if (matches.length === 1) return matches[0]
    if (matches.length > 1) return matches[0]
  }

  for (const c of candidates) {
    const matches = findMatchingEnvironments(environments, c)
    if (matches.length === 1) return matches[0]
    if (matches.length > 1) return matches[0]
  }

  if (environments.length > 0) return environments[0]
  throw new Error('No environments available')
}

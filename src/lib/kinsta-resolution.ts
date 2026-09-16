import {findMatchingSites} from './kinsta-selectors.js'
import {getAllSites} from './kinsta.js'

export type ResolveProgress = {
  start: (label: string) => void
  stop: (status?: string) => void
}

export const compact = (values: Array<string | undefined>): string[] => values.filter((value): value is string => value !== undefined && value.length > 0)
export const toLower = (value: string): string => value.trim().toLowerCase()
export const hasMatchingId = (id: string, candidates: Array<{id: string}>): boolean => candidates.some((candidate) => toLower(candidate.id) === toLower(id))

export const withProgress = async <T>(
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

export const requireCompanyId = (company: string): string => {
  const normalizedCompany = company.trim()
  if (normalizedCompany.length === 0) {
    throw new Error('Provide --company or set IROOTS_KINSTA_COMPANY_ID.')
  }

  return normalizedCompany
}

type ValidateSiteIdAndNameMatchInput = {
  apiKey: string
  company: string
  getAllSites: typeof getAllSites
  progress?: ResolveProgress
}

export const validateSiteIdAndNameMatch = async (input: ValidateSiteIdAndNameMatchInput, siteId: string, site: string | undefined): Promise<void> => {
  if (site === undefined) {
    return
  }

  const normalizedCompany = input.company.trim()
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

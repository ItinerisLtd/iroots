import {ux} from '@oclif/core'
import {FlagOutput} from '@oclif/core/lib/interfaces/parser.js'

const apiUrl = 'https://sentry.io/api/0'

async function request<TResponse>(token: string, url: string, options: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(options?.headers)
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')
  options.headers = headers
  options.method ??= 'GET'
  if (options.body) {
    options.method = 'POST'
  }

  const fetchUrl = `${apiUrl}/${url}`
  const response = await fetch(fetchUrl.endsWith('/') ? '' : `${fetchUrl}/`, options)
  let json: {detail?: string} = {}
  if (response.body) {
    json = await response.json()
  }

  if (response.status > 400) {
    if (json.detail) {
      ux.error(json.detail)
    }

    ux.error(response.statusText)
  }

  if (json) {
    return json as TResponse
  }

  return true as TResponse
}

type SentryAvatar = {
  avatarType: string
  avatarUuid?: string | null
  avatarUrl?: string | null
}

type SentryListProjectsResponse = {
  id: string
  slug: string
  name: string
  platform: string
  dateCreated: string
  isBookmarked: boolean
  isMember: boolean
  features: string[]
  firstEvent: string
  firstTransactionEvent: boolean
  access: string[]
  hasAccess: boolean
  hasCustomMetrics: boolean
  hasMinifiedStackTrace: boolean
  hasMonitors: boolean
  hasProfiles: boolean
  hasReplays: boolean
  hasFeedbacks: boolean
  hasNewFeedbacks: boolean
  hasSessions: boolean
  isInternal: boolean
  isPublic: boolean
  avatar: SentryAvatar
  color: string
  status: string
  organization: {
    id: string
    slug: string
    status: string[]
    name: string
    dateCreated: string
    isEarlyAdopter: boolean
    require2FA: boolean
    requireEmailVerification: boolean
    avatar: SentryAvatar
    features: string[]
    links: {
      organizationUrl: string
      regionUrl: string
    }
    hasAuthProvider: boolean
  }
}

type SentryListProjectKeysResponse = {
  id: string
  name: string
  label: string
  public: string
  secret: string
  projectId: number
  isActive: boolean
  rateLimit: {
    window: number
    count: number
  }
  dsn: {
    secret: string
    public: string
    csp: string
    security: string
    minidump: string
    nel: string
    unreal: string
    cdn: string
  }
  browserSdkVersion: string
  browserSdk: {
    choices: Array<Array<Array<string>>>
  }
  dateCreated: string
  dynamicSdkLoaderOptions: {
    hasReplay: boolean
    hasPerformance: boolean
    hasDebug: boolean
  }
}

export async function getProject(
  token: string,
  organisationSlug: string,
  projectSlug: string,
): Promise<SentryListProjectsResponse> {
  return request<SentryListProjectsResponse>(token, `projects/${organisationSlug}/${projectSlug}`)
}

export async function getAllProjects(token: string): Promise<SentryListProjectsResponse[]> {
  return request<SentryListProjectsResponse[]>(token, 'projects')
}

export async function createProject(args: FlagOutput): Promise<SentryListProjectsResponse[]> {
  const options = {
    body: JSON.stringify(args),
  }

  return request<SentryListProjectsResponse[]>(
    args.apiKey,
    `teams/${args.organisationSlug}/${args.teamSlug}/projects`,
    options,
  )
}

export async function getAllProjectKeys(
  token: string,
  organisationSlug: string,
  projectSlug: string,
): Promise<SentryListProjectKeysResponse[]> {
  return request<SentryListProjectKeysResponse[]>(token, `projects/${organisationSlug}/${projectSlug}/keys`)
}

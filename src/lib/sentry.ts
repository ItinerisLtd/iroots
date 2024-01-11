import {ux} from '@oclif/core'

const apiUrl = 'https://sentry.io/api/0'

async function request<TResponse>(token: string, url: string, options: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(options?.headers)
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')
  options.headers = headers
  options.method ??= 'GET'

  const fetchUrl = `${apiUrl}/${url}`
  const response = await fetch(fetchUrl.endsWith('/') ? '' : `${fetchUrl}/`, options)
  if (response.status > 400) {
    ux.error(response.statusText)
  }

  if (response.body) {
    return (await response.json()) as TResponse
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

export async function getAllProjects(token: string): Promise<SentryListProjectsResponse[]> {
  return request<SentryListProjectsResponse[]>(token, 'projects')
}

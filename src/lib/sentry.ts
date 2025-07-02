import {ux} from '@oclif/core'
import {OutputFlags} from '@oclif/core/interfaces'

import {slugify} from './misc.js'

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
  if (options.method === 'DELETE' && response.status === 204) {
    return response as TResponse
  }

  let json: {detail?: string} = {}
  if (response.body) {
    json = await response.json()
  }

  if (response.status >= 400) {
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
  avatarUrl?: null | string
  avatarUuid?: null | string
}

type SentryListProjectsResponse = {
  access: string[]
  avatar: SentryAvatar
  color: string
  dateCreated: string
  features: string[]
  firstEvent: string
  firstTransactionEvent: boolean
  hasAccess: boolean
  hasCustomMetrics: boolean
  hasFeedbacks: boolean
  hasMinifiedStackTrace: boolean
  hasMonitors: boolean
  hasNewFeedbacks: boolean
  hasProfiles: boolean
  hasReplays: boolean
  hasSessions: boolean
  id: string
  isBookmarked: boolean
  isInternal: boolean
  isMember: boolean
  isPublic: boolean
  name: string
  organization: {
    avatar: SentryAvatar
    dateCreated: string
    features: string[]
    hasAuthProvider: boolean
    id: string
    isEarlyAdopter: boolean
    links: {
      organizationUrl: string
      regionUrl: string
    }
    name: string
    require2FA: boolean
    requireEmailVerification: boolean
    slug: string
    status: string[]
  }
  platform: string
  slug: string
  status: string
}

type SentryCreateProjectResponse = {
  access: string[]
  avatar: SentryAvatar
  color: string
  dateCreated: string
  features: string[]
  firstEvent: string
  firstTransactionEvent: boolean
  hasAccess: boolean
  hasCustomMetrics: boolean
  hasMinifiedStackTrace: boolean
  hasMonitors: boolean
  hasProfiles: boolean
  hasReplays: boolean
  hasSessions: boolean
  id: string
  isBookmarked: boolean
  isInternal: boolean
  isMember: boolean
  isPublic: boolean
  name: string
  platform: string
  slug: string
  status: string
}

type SentryListProjectKeysResponse = {
  browserSdk: {
    choices: Array<Array<Array<string>>>
  }
  browserSdkVersion: string
  dateCreated: string
  dsn: {
    cdn: string
    csp: string
    minidump: string
    nel: string
    public: string
    secret: string
    security: string
    unreal: string
  }
  dynamicSdkLoaderOptions: {
    hasDebug: boolean
    hasPerformance: boolean
    hasReplay: boolean
  }
  id: string
  isActive: boolean
  label: string
  name: string
  projectId: number
  public: string
  rateLimit: {
    count: number
    window: number
  }
  secret: string
}

type SentryDeleteProjectResponse = {
  status: number
  statusText: string
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

export async function createProject(args: OutputFlags<any>): Promise<SentryCreateProjectResponse> {
  const slug = args.slug ?? args.name
  // Ensure the slug is always safe to use.
  args.slug = slugify(slug.toLowerCase())
  const options = {
    body: JSON.stringify(args),
  }

  return request<SentryCreateProjectResponse>(
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

export async function deleteProject(
  token: string,
  organisation: string,
  project: string,
): Promise<SentryDeleteProjectResponse> {
  return request<SentryDeleteProjectResponse>(token, `projects/${organisation}/${project}`, {method: 'DELETE'})
}

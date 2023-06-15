const apiUrl = 'https://api.statuscake.com/v1'

async function request<TResponse>(token: string, url: string, options: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(options?.headers)
  headers.set('authorization', `Bearer ${token}`)
  options.headers = headers
  options.method ??= 'GET'

  return fetch(`${apiUrl}/${url}`, options)
    .then(resp => resp.json())
    .then(data => data as TResponse)
}

export type StatusCakeUptimeStatus = 'up' | 'down'

type StatusCakeUptimeListQueryArgs = {
  status: StatusCakeUptimeStatus
  page: number
  limit: number
  tags: string[]
  matchany: boolean
  nouptime: boolean
  [key: string]: string | string[] | number | boolean | undefined
}

type StatusCakeUptimeTestOverview = {
  id: string
  name: string
  // eslint-disable-next-line camelcase
  website_url: string
  // eslint-disable-next-line camelcase
  test_type: 'DNS' | 'HEAD' | 'HTTP' | 'PING' | 'SMTP' | 'SSH' | 'TCP'
  // eslint-disable-next-line camelcase
  check_rate: number
  // eslint-disable-next-line camelcase
  contact_groups: string[]
  paused: boolean
  status: 'up' | 'down'
  tags?: string[]
  uptime: number // is actually a float
}

type StatusCakeUptimeTest = StatusCakeUptimeTestOverview & {
  confirmation: number
  // eslint-disable-next-line camelcase
  dns_ips: string[]
  // eslint-disable-next-line camelcase
  do_not_find: boolean
  // eslint-disable-next-line camelcase
  enable_ssl_alert: boolean
  // eslint-disable-next-line camelcase
  follow_redirects: boolean
  host: string
  // eslint-disable-next-line camelcase
  include_header: boolean
  // eslint-disable-next-line camelcase
  last_tested_at: Date
  // eslint-disable-next-line camelcase
  next_location: string
  paused: boolean
  processing: boolean
  // eslint-disable-next-line camelcase
  processing_on: string
  // eslint-disable-next-line camelcase
  processing_state: 'complete' | 'pretest' | 'retest' | 'up_retest'
  servers: string[]
  status: 'up'
  // eslint-disable-next-line camelcase
  status_codes: string[]
  tags: []
  timeout: number
  // eslint-disable-next-line camelcase
  trigger_rate: number
  uptime: 99.9
  // eslint-disable-next-line camelcase
  use_jar: boolean
  // eslint-disable-next-line camelcase
  user_agent: string
}

type StatusCakePagination = {
  page: number
  // eslint-disable-next-line camelcase
  per_page: number
  // eslint-disable-next-line camelcase
  page_count: number
  // eslint-disable-next-line camelcase
  total_count: number
}

type StatusCakeUptimeListResponse = {
  data: StatusCakeUptimeTestOverview[]
  metadata: StatusCakePagination
}

type StatusCakeUptimeGetResponse = {
  data: StatusCakeUptimeTest
}

export async function getAllUptimes(
  token: string,
  queryArgs: StatusCakeUptimeListQueryArgs,
): Promise<StatusCakeUptimeTestOverview[]> {
  const query = new URLSearchParams()
  for (const key in queryArgs) {
    if (!Object.prototype.hasOwnProperty.call(queryArgs, key)) {
      continue
    }

    if (!queryArgs[key] || (Array.isArray(queryArgs[key]) && (<Array<string>>queryArgs[key]).length === 0)) {
      continue
    }

    query.set(key, queryArgs[key] as string)
  }

  const url = `uptime?${query.toString()}`
  const response = await request<StatusCakeUptimeListResponse>(token, url)

  return response.data
}

export async function getSiteUptime(token: string, testId: number): Promise<StatusCakeUptimeTest> {
  const url = `uptime/${testId}`
  const response = await request<StatusCakeUptimeGetResponse>(token, url)

  return response.data
}

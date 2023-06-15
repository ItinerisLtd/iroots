import {FlagOutput} from '@oclif/core/lib/interfaces/parser.js'

const apiUrl = 'https://api.statuscake.com/v1'

async function request<TResponse>(token: string, url: string, options: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(options?.headers)
  headers.set('authorization', `Bearer ${token}`)
  options.headers = headers
  options.method ??= 'GET'

  const fetchUrl = new URL(`${apiUrl}/${url}`)
  fetchUrl.searchParams.delete('apiKey')

  return fetch(fetchUrl, options)
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

type StatusCakeUptimeTestBaseType = {
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
  tags?: string[]
}

type StatusCakeUptimeTestOverview = StatusCakeUptimeTestBaseType & {
  id: string
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
  status: 'up' | 'down'
  // eslint-disable-next-line camelcase
  status_codes: string[]
  tags: []
  timeout: number
  // eslint-disable-next-line camelcase
  trigger_rate: number
  uptime: number // is actually a float
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

type StatusCakeUptimeCreateResponse = {
  data: {
    // eslint-disable-next-line camelcase
    new_id: string
  }
  message?: string
  errors?: {
    length: number
    [key: string]: string[] | number
  }
}

type StatusCakeUptimeCreateQueryArgs = StatusCakeUptimeTest & {
  // eslint-disable-next-line camelcase
  basic_username: string
  // eslint-disable-next-line camelcase
  basic_password: string
  // eslint-disable-next-line camelcase
  custom_header: string
  // eslint-disable-next-line camelcase
  dns_server: string
  // eslint-disable-next-line camelcase
  enable_ssl_alert: boolean
  // eslint-disable-next-line camelcase
  final_endpoint: string
  // eslint-disable-next-line camelcase
  find_string: string
  // eslint-disable-next-line camelcase
  follow_redirects: boolean
  port: number
  // eslint-disable-next-line camelcase
  post_body: string
  // eslint-disable-next-line camelcase
  post_raw: string
  regions: string[]
  // eslint-disable-next-line camelcase
  status_codes_csv: string
  [key: string]: string | string[] | boolean | number | Record<'new_id', string>
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

export async function createUptimeTest(token: string, args: FlagOutput): Promise<StatusCakeUptimeCreateResponse> {
  const queryArgs = args as StatusCakeUptimeCreateQueryArgs
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

  const contactGroups = query.get('contact_groups')
  if (contactGroups?.length) {
    query.delete('contact_groups')
    query.set('contact_groups[]', contactGroups)
  }

  const websiteUrl = query.get('website_url')
  if (websiteUrl?.length) {
    const websiteUrlFixed = new URL(websiteUrl)
    websiteUrlFixed.searchParams.set('statuscake', '')
    query.set('website_url', websiteUrlFixed.toString())
  }

  const url = `uptime`
  const response = await request<StatusCakeUptimeCreateResponse>(token, url, {method: 'POST', body: query})

  return response
}

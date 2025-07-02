import {OutputFlags} from '@oclif/core/interfaces'

const apiUrl = 'https://api.statuscake.com/v1'

async function request<TResponse>(token: string, url: string, options: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(options?.headers)
  headers.set('authorization', `Bearer ${token}`)
  options.headers = headers
  options.method ??= 'GET'

  const fetchUrl = new URL(`${apiUrl}/${url}`)
  fetchUrl.searchParams.delete('apiKey')

  const response = await fetch(fetchUrl, options)
  if (response.status === 204 || response.statusText.toLowerCase() === 'no content') {
    return null as TResponse
  }

  return response.json() as TResponse
}

export type StatusCakeUptimeStatus = 'down' | 'up'

type StatusCakeUptimeListQueryArgs = {
  [key: string]: boolean | number | string | string[] | undefined
  limit: number
  matchany: boolean
  nouptime: boolean
  page: number
  status: StatusCakeUptimeStatus
  tags: string[]
}

type StatusCakeUptimeTestBaseType = {

  check_rate: number

  contact_groups: string[]
  name: string
  paused: boolean
  tags?: string[]

  test_type: 'DNS' | 'HEAD' | 'HTTP' | 'PING' | 'SMTP' | 'SSH' | 'TCP'

  website_url: string
}

type StatusCakeUptimeTestOverview = StatusCakeUptimeTestBaseType & {
  id: string
}

type StatusCakeUptimeTest = StatusCakeUptimeTestOverview & {
  confirmation: number

  dns_ips: string[]

  do_not_find: boolean

  enable_ssl_alert: boolean

  follow_redirects: boolean
  host: string

  include_header: boolean

  last_tested_at: Date

  next_location: string
  paused: boolean
  processing: boolean

  processing_on: string

  processing_state: 'complete' | 'pretest' | 'retest' | 'up_retest'
  servers: string[]
  status: 'down' | 'up'

  status_codes: string[]
  tags: []
  timeout: number

  trigger_rate: number
  uptime: number // is actually a float

  use_jar: boolean

  user_agent: string
}

type StatusCakePagination = {
  page: number

  page_count: number

  per_page: number

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

    new_id: string
  }
  errors?: {
    [key: string]: number | string[]
    length: number
  }
  message?: string
}

type StatusCakeUptimeDeleteResponse = {
  errors?: {
    [key: string]: number | string[]
    length: number
  }
  message?: string
}

type StatusCakeUptimeCreateQueryArgs = StatusCakeUptimeTest & {

  [key: string]: boolean | number | Record<'new_id', string> | string | string[]

  basic_password: string

  basic_username: string

  custom_header: string

  dns_server: string

  enable_ssl_alert: boolean

  final_endpoint: string

  find_string: string
  follow_redirects: boolean

  port: number

  post_body: string
  post_raw: string

  regions: string[]
  status_codes_csv: string
}

export async function getAllUptimes(
  token: string,
  queryArgs: StatusCakeUptimeListQueryArgs,
): Promise<StatusCakeUptimeTestOverview[]> {
  const query = new URLSearchParams()
  for (const key in queryArgs) {
    if (!Object.hasOwn(queryArgs, key)) {
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

export async function createUptimeTest(token: string, args: OutputFlags<any>): Promise<StatusCakeUptimeCreateResponse> {
  const queryArgs = args as StatusCakeUptimeCreateQueryArgs
  const query = new URLSearchParams()
  for (const key in queryArgs) {
    if (!Object.hasOwn(queryArgs, key)) {
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
    query.set('website_url', websiteUrlFixed.toString().replace('?statuscake=', '?statuscake'))
  }

  const url = `uptime`
  const response = await request<StatusCakeUptimeCreateResponse>(token, url, {body: query, method: 'POST'})

  return response
}

export async function deleteUptimeTest(token: string, testId: string): Promise<null | StatusCakeUptimeDeleteResponse> {
  return request<null | StatusCakeUptimeDeleteResponse>(token, `uptime/${testId}`, {method: 'DELETE'})
}

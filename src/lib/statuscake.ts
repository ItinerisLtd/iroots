const apiUrl = 'https://api.statuscake.com/v1'

async function request<TResponse>(token: string, url: string, options: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(options?.headers)
  headers.set('authorization', `Bearer ${token}`)
  options.headers = headers
  options.method ??= 'GET'

  const foo = `${apiUrl}/${url}`
  console.log(foo)

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
  test_type: string
  // eslint-disable-next-line camelcase
  check_rate: number
  // eslint-disable-next-line camelcase
  contact_groups: string[] // TODO make type
  paused: boolean
  status: 'up' | 'down'
  tags?: string[] // TODO make type
  uptime: number // is actually a float
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

export async function getAllUptimes(
  token: string,
  queryArgs: StatusCakeUptimeListQueryArgs,
): Promise<StatusCakeUptimeTestOverview[]> {
  console.log(queryArgs)
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

  console.log(query)
  const url = `uptime?${query.toString()}`
  console.log(url)
  const response = await request<StatusCakeUptimeListResponse>(token, url)
  console.log(response)

  return response.data
}

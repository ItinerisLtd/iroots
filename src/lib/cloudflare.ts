const apiUrl = 'https://api.cloudflare.com/client/v4/accounts/{account_identifier}/challenges/widgets'

type CloudflareSite = {
  // eslint-disable-next-line camelcase
  bot_fight_mode: boolean
  // eslint-disable-next-line camelcase
  clearance_level: string
  // eslint-disable-next-line camelcase
  created_on: string
  domains: string[]
  mode: string
  // eslint-disable-next-line camelcase
  modified_on: string
  name: string
  offlabel: boolean
  region: string
  secret: string
  sitekey: string
}

type CloudflareSiteRequest = {
  errors: string[]
  messages: string[]
  success: boolean
  result: CloudflareSite
}

type CloudflareSitesRequest = {
  errors: string[]
  messages: string[]
  success: boolean
  // eslint-disable-next-line camelcase
  result_info: {
    count: number
    page: number
    // eslint-disable-next-line camelcase
    per_page: number
    // eslint-disable-next-line camelcase
    total_count: number
  }
  result: CloudflareSite[]
}

async function request<TResponse>(
  token: string,
  account: string,
  url: string = '',
  options: RequestInit = {},
): Promise<TResponse> {
  const headers = new Headers(options?.headers)
  headers.set('authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')
  options.headers = headers
  options.method ??= 'GET'

  const requestUrl = new URL(apiUrl.replace('{account_identifier}', account))
  if (url.length > 0) {
    requestUrl.pathname = `${requestUrl.pathname}/${url}`
  }

  return fetch(requestUrl, options)
    .then(resp => resp.json())
    .then(data => data as TResponse)
}

export async function getAllSites(token: string, account: string): Promise<CloudflareSite[]> {
  const response = await request<CloudflareSitesRequest>(token, account)

  return response.result as CloudflareSite[]
}

export async function getSite(token: string, account: string, siteKey: string): Promise<CloudflareSite> {
  const response = await request<CloudflareSiteRequest>(token, account, siteKey)

  return response.result as CloudflareSite
}

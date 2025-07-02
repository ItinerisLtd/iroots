import {ux} from '@oclif/core'
import {OutputFlags} from '@oclif/core/parser'

const apiUrl = 'https://api.cloudflare.com/client/v4'
const turnstileApiUrl = `${apiUrl}/accounts/{account_identifier}/challenges/widgets`
const zonesApiUrl = `${apiUrl}/zones/{zone_id}`

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

type CloudflareError = {
  success: boolean
  errors: [
    {
      code: number
      message: string
    },
  ]
}

async function request<TResponse>(
  token: string,
  url: URL | string = '',
  options: RequestInit = {},
): Promise<TResponse> {
  const headers = new Headers(options?.headers)
  headers.set('authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')
  options.headers = headers
  options.method ??= 'GET'

  const response = await fetch(url, options)
  const data = await response.json()
  const statusCode = data.status || response.status
  if (statusCode !== 200) {
    const error = data as CloudflareError
    const errors = error.errors.map(err => `code: ${err.code} - message: ${err.message}`)
    ux.error(errors.join('\n'))
  }

  return data as TResponse
}

async function turnstileRequest<TResponse>(
  token: string,
  account: string,
  url: string = '',
  options: RequestInit = {},
): Promise<TResponse> {
  const requestUrl = new URL(turnstileApiUrl.replace('{account_identifier}', account))
  if (url.length > 0) {
    requestUrl.pathname = `${requestUrl.pathname}/${url}`
  }

  return request<TResponse>(token, requestUrl, options)
}

export async function getAllTurnstileWidgets(token: string, account: string): Promise<CloudflareSite[]> {
  const response = await turnstileRequest<CloudflareSitesRequest>(token, account)

  return response.result as CloudflareSite[]
}

export async function getTurnstileWidget(token: string, account: string, siteKey: string): Promise<CloudflareSite> {
  const response = await turnstileRequest<CloudflareSiteRequest>(token, account, siteKey)

  return response.result as CloudflareSite
}

export async function createTurnstileWidget(
  token: string,
  account: string,
  args: OutputFlags<any>,
): Promise<CloudflareSite> {
  const response = await turnstileRequest<CloudflareSiteRequest>(token, account, '', {
    method: 'POST',
    body: JSON.stringify(args),
  })

  return response.result as CloudflareSite
}

export async function deleteTurnstileWidget(token: string, account: string, siteKey: string): Promise<CloudflareSite> {
  const response = await turnstileRequest<CloudflareSiteRequest>(token, account, siteKey, {
    method: 'DELETE',
  })

  return response.result as CloudflareSite
}

async function zoneRequest<TResponse>(
  token: string,
  zoneId: string,
  url: string = '',
  options: RequestInit = {},
): Promise<TResponse> {
  const requestUrl = new URL(zonesApiUrl.replace('{zone_id}', zoneId))
  if (url.length > 0) {
    requestUrl.pathname = `${requestUrl.pathname}/${url}`
  }

  return request<TResponse>(token, requestUrl, options)
}

async function dnsRequest<TResponse>(
  token: string,
  zoneId: string,
  options: RequestInit = {},
  endpoint: string = '',
): Promise<TResponse> {
  let url = 'dns_records'
  if (endpoint.length > 0) {
    url = `${url}/${endpoint}`
  }

  return zoneRequest<TResponse>(token, zoneId, url, options)
}

export async function createDnsRecord(token: string, zoneId: string, args: OutputFlags<any>): Promise<CloudflareSite> {
  // Cloudflare requires TXT content to be wrapped in quotes
  if (args.type === 'TXT') {
    // Remove all quotes from the content
    args.content = args.content.replace(/"/g, '')
    // Wrap the content in quotes if it is not already
    args.content = `"${args.content}"`
  }

  const response = await dnsRequest<CloudflareSiteRequest>(token, zoneId, {
    method: 'POST',
    body: JSON.stringify(args),
  })
  return response.result as CloudflareSite
}

export async function listDnsRecords(token: string, zoneId: string): Promise<CloudflareSite> {
  const response = await dnsRequest<CloudflareSiteRequest>(token, zoneId, {
    method: 'GET',
  })
  return response.result as CloudflareSite
}

export async function deleteDnsRecord(token: string, zoneId: string, recordId: string): Promise<CloudflareSite> {
  const response = await dnsRequest<CloudflareSiteRequest>(
    token,
    zoneId,
    {
      method: 'DELETE',
    },
    recordId,
  )
  return response.result as CloudflareSite
}

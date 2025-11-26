import { ux } from '@oclif/core'
import { OutputFlags } from '@oclif/core/parser'

const apiUrl = 'https://api.cloudflare.com/client/v4'
const turnstileApiUrl = `${apiUrl}/accounts/{account_identifier}/challenges/widgets`
const zonesApiUrl = `${apiUrl}/zones/{zone_id}`

type CloudflareSite = {
  bot_fight_mode: boolean

  clearance_level: string

  created_on: string
  domains: string[]
  mode: string

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
  result: CloudflareSite
  success: boolean
}

type CloudflareSitesRequest = {
  errors: string[]
  messages: string[]
  result: CloudflareSite[]

  result_info: {
    count: number
    page: number

    per_page: number

    total_count: number
  }
  success: boolean
}

type CloudflareError = {
  errors: [
    {
      code: number
      message: string
    },
  ]
  success: boolean
}

type CloudflareZone = {
  account: {
    id: string
    name: string
  }
  activated_on: string
  created_on: string
  development_mode: number
  id: string
  meta: {
    cdn_only: boolean
    custom_certificate_quota: number
    dns_only: boolean
    foundation_dns: boolean
    page_rule_quota: number
    phishing_detected: boolean
    step: number
  }
  modified_on: string
  name: string
  original_dnshost?: string
  original_name_servers?: string[]
  original_registrar?: string
  paused: boolean
  status: string
  type: string
}

type CloudflareZoneRequest = {
  errors: string[]
  messages: string[]
  result: CloudflareZone

  success: boolean
}

export type CloudflareZeroTrustSelfHostedApplication = {
  allowed_idps: string[]
  app_launcher_visible: boolean
  aud: string
  auto_redirect_to_identity: boolean
  created_at: string
  destinations: {
    type: string
    uri: string
  }[]
  domain: string
  enable_binding_cookie: boolean
  http_only_cookie_attribute: boolean
  id: string
  name: string
  options_preflight_bypass: boolean
  policies: {
    created_at: string
    decision: string
    exclude: []
    id: string
    include: {
      email_domain: {
        domain: string
      }
    }[]
    name: string
    precedence: number
    require: []
    reusable: boolean
    session_duration: string
    uid: string
    updated_at: string
  }[]
  self_hosted_domains: string[]
  session_duration: string
  tags: string[]
  type: string
  uid: string
  updated_at: string
}

export type CloudflareZeroTrustAccessApplicationsRequest = {
  errors: {
    code: number
    documentation_url: string
    message: string
    source: { pointer: string }
  }
  messages: {
    code: number
    documentation_url: string
    message: string
    source: { pointer: string }
  }
  result: CloudflareZeroTrustSelfHostedApplication[]
  result_info: {
    count: number
    page: number
    per_page: number
    total_count: number
    total_pages: number
  }
  success: boolean
}

async function request<TResponse>(
  token: string,
  url: string | URL = '',
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
    body: JSON.stringify(args),
    method: 'POST',
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
    args.content = args.content.replaceAll('"', '')
    // Wrap the content in quotes if it is not already
    args.content = `"${args.content}"`
  }

  const response = await dnsRequest<CloudflareSiteRequest>(token, zoneId, {
    body: JSON.stringify(args),
    method: 'POST',
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

export async function getZoneDetails(token: string, zoneId: string): Promise<CloudflareZoneRequest> {
  return zoneRequest<CloudflareZoneRequest>(token, zoneId)
}

async function zeroTrustAccessRequest<TResponse>(
  token: string,
  zoneId: string,
  endpoint: string = '',
  options: RequestInit = {},
): Promise<TResponse> {
  let url = 'access'
  if (endpoint.length > 0) {
    url = `${url}/${endpoint}`
  }

  return zoneRequest<TResponse>(token, zoneId, url, options)
}

export async function getListOfZeroTrustAccessApplications(
  token: string,
  zoneId: string,
): Promise<CloudflareZeroTrustSelfHostedApplication[]> {
  const response = await zeroTrustAccessRequest<CloudflareZeroTrustAccessApplicationsRequest>(token, zoneId, 'apps')

  return response.result as CloudflareZeroTrustSelfHostedApplication[]
}

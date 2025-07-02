import {ux} from '@oclif/core'

const apiUrl = 'https://api.sendgrid.com/v3'

type SendGridApiKey = {

  api_key: string

  api_key_id: string
  name: string
  scopes: string[]
}

type SendGridError = {
  field: string
  help: string
  message: string
}

type SendGridApiKeyResponse = SendGridApiKey & {
  errors: SendGridError[]
}

type SendGridApiKeysResponse = {
  errors: SendGridError[]
  result: SendGridApiKey[]
}

type SendGridAllowedIP = {

  created_at: Date
  id: number
  ip: string

  updated_at: Date
}

type SendGridAllowedIpResponse = {
  result: SendGridAllowedIP
}

type SendGridAllowedIpsResponse = {
  result: SendGridAllowedIP[]
}

type SendGridAddAllowedIpsResponse = SendGridAllowedIpResponse

async function request<TResponse>(token: string, url: string, options: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(options?.headers)
  headers.set('authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')
  options.headers = headers
  options.method ??= 'GET'

  const response = await fetch(`${apiUrl}/${url}`, options)
  if (response.status > 400) {
    ux.error(response.statusText)
  }

  if (response.body) {
    return (await response.json()) as TResponse
  }

  return true as TResponse
}

export async function getApiKey(token: string, key: string): Promise<SendGridApiKeyResponse> {
  return request<SendGridApiKeyResponse>(token, `api_keys/${key}`)
}

export async function getAllApiKeys(token: string, limit: number = 0): Promise<SendGridApiKeysResponse> {
  let endpoint = 'api_keys'
  if (limit > 0) {
    endpoint = `${endpoint}?limit=${limit}`
  }

  return request<SendGridApiKeysResponse>(token, endpoint)
}

export async function createApiKey(token: string, name: string, scopes: string[]): Promise<SendGridApiKeyResponse> {
  const body = {
    name,
    scopes,
  }
  return request<SendGridApiKeyResponse>(token, 'api_keys', {
    body: JSON.stringify(body),
    method: 'POST',
  })
}

export async function deleteApiKey(token: string, key: string): Promise<SendGridError[] | true> {
  const options = {} as RequestInit
  const headers = new Headers()
  headers.set('authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')
  options.headers = headers
  options.method = 'DELETE'

  const response = await fetch(`${apiUrl}/api_keys/${key}`, options)
  if (response.body instanceof ReadableStream) {
    const json = await response.json()
    return json.errors as SendGridError[]
  }

  return true
}

export async function getAllAllowedIp(token: string, ruleId: string) {
  return request<SendGridAllowedIpResponse>(token, `access_settings/whitelist/${ruleId}`)
}

export async function getAllAllowedIps(token: string) {
  return request<SendGridAllowedIpsResponse>(token, 'access_settings/whitelist')
}

export async function addAllowedIps(token: string, ipAddresses: string[]) {
  return request<SendGridAddAllowedIpsResponse>(token, 'access_settings/whitelist', {
    body: JSON.stringify({
      ips: ipAddresses.map(ip => ({ip})),
    }),
    method: 'POST',
  })
}

export async function deleteAllowedIps(token: string, ruleIds: string[]) {
  const ids = ruleIds.map(id => Number.parseInt(id, 10))
  return request<boolean>(token, 'access_settings/whitelist', {
    body: JSON.stringify({
      ids,
    }),
    method: 'DELETE',
  })
}

import {createHmac, randomUUID} from 'node:crypto'

import {ukSort} from './utility.js'

const apiHost = 'https://packagist.com'

type PackagistApiResponseError = {
  documentationUrl: string
  message: string
  status: string
}

type PackagistApiResponseSuccess = {
  access: string
  accessToAllPackages: boolean
  description: string
  expiresAt: string
  id: number
  lastUsed: string
  teamId: number
  token: string
  url: string
  user: string
}

type PackagistApiParams = {
  body?: string
  cnonce: string
  key: string
  timestamp: string
}

export type PackagistNewTokenParam = {
  access: 'read' | 'update'
  accessToAllPackages?: boolean
  description: string
  expiresAt?: string
  teamId?: number
}

export type PackagistRegenerateTokenParam = {
  expiresAt?: string
  IConfirmOldTokenWillStopWorkingImmediately: boolean
  tokenId: number
}

type PackagistApiKeyResponse = PackagistApiResponseError & PackagistApiResponseSuccess

function signHmacSha256(key: string, str: string): string {
  const hmac = createHmac('sha256', key)
  return hmac.update(Buffer.from(str, 'utf8')).digest('base64')
}

function generateSignature(url: string, params: PackagistApiParams, secret: string, options: RequestInit = {}) {
  const qsParams = new URLSearchParams(params)
  const signatureString = `${options.method}\n${apiHost.replace('https://', '')}\n/${url}\n${qsParams.toString()}`
  return signHmacSha256(secret, signatureString)
}

async function request<TResponse>(
  key: string,
  secret: string,
  url: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const headers = new Headers(options?.headers)
  const params: PackagistApiParams = {
    cnonce: randomUUID(),
    key,
    // Get Unix timestamp in seconds.
    timestamp: Math.floor(Date.now() / 1000).toString(),
  }
  options.method ??= 'GET'

  if (options?.body) {
    params.body = options.body as string
  }

  // Need to be alphabatic order.
  const paramsSorted = ukSort(params) as PackagistApiParams
  const signature = generateSignature(url, paramsSorted, secret, options)
  headers.set(
    'Authorization',
    `PACKAGIST-HMAC-SHA256 Cnonce=${paramsSorted.cnonce} Key=${paramsSorted.key} Timestamp=${paramsSorted.timestamp} Signature=${signature}`,
  )
  headers.set('Accept', 'application/json')
  headers.set('Content-Type', 'application/json')

  options.headers = headers

  return fetch(`${apiHost}/${url}`, options)
    .then(resp => resp.json())
    .then(data => data as TResponse)
}

export async function getAllTokens(key: string, secret: string): Promise<PackagistApiKeyResponse> {
  return request<PackagistApiKeyResponse>(key, secret, 'api/tokens/')
}

export async function deleteToken(
  key: string,
  secret: string,
  tokenId: number,
): Promise<PackagistApiResponseError | Record<string, never>> {
  return request<PackagistApiResponseError | Record<string, never>>(key, secret, `api/tokens/${tokenId}/`, {
    method: 'DELETE',
  })
}

export async function createToken(
  key: string,
  secret: string,
  params: PackagistNewTokenParam,
): Promise<PackagistApiKeyResponse> {
  return request<PackagistApiKeyResponse>(key, secret, 'api/tokens/', {
    body: JSON.stringify(params),
    method: 'POST',
  })
}

export async function regenerateToken(
  key: string,
  secret: string,
  args: PackagistRegenerateTokenParam,
): Promise<PackagistApiKeyResponse> {
  const {tokenId, ...params} = args

  return request<PackagistApiKeyResponse>(key, secret, `api/tokens/${tokenId}/regenerate`, {
    body: JSON.stringify(params),
    method: 'POST',
  })
}

import {v4 as uuidv4} from 'uuid'
import {ukSort} from './utility.js'
import {createHmac} from 'node:crypto'

const apiHost = 'https://packagist.com'

type PackagistApiResponseError = {
  status: string
  message: string
  documentationUrl: string
}

type PackagistApiResponseSuccess = {
  description: string
  access: string
  expiresAt: string
  id: number
  url: string
  user: string
  token: string
  lastUsed: string
  teamId: number
  accessToAllPackages: boolean
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
  tokenId: number
  IConfirmOldTokenWillStopWorkingImmediately: boolean
  expiresAt?: string
}

type PackagistApiKeyResponse = PackagistApiResponseError | PackagistApiResponseSuccess

function signHmacSha256(key: string, str: string): string {
  const hmac = createHmac('sha256', key)
  return hmac.update(Buffer.from(str, 'utf-8')).digest('base64')
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
    cnonce: uuidv4(),
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
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function regenerateToken(
  key: string,
  secret: string,
  args: PackagistRegenerateTokenParam,
): Promise<PackagistApiKeyResponse> {
  const {tokenId, ...params} = args

  return request<PackagistApiKeyResponse>(key, secret, `api/tokens/${tokenId}/regenerate`, {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

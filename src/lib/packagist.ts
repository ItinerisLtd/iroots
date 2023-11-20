import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { ukSort } from './utility.js';

const apiHost = 'https://packagist.com'

type PackagistApiResponseError = {
  status: string
  message: string
  documentationUrl: string
}

type PackagistApiResponseSuccess = {
  description: string,
  access: string,
  expiresAt: string,
  id: number,
  url: string,
  user: string,
  token: string,
  lastUsed: string,
  teamId: number,
  accessToAllPackages: boolean
}

type PackagistApiParams = {
  body?: string,
  cnonce: string,
  key: string,
  timestamp: string,
}

export type PackagistNewTokenParam = {
  description: string,
  access: "read"|"update",
  accessToAllPackages?: boolean,
  teamId?: number,
  expiresAt?: string,
}

type PackagistApiKeyResponse = PackagistApiResponseError|PackagistApiResponseSuccess;

function signHmacSha256(key: string, str: string):string {
  const hmac = crypto.createHmac("sha256", key);
    return hmac.update(Buffer.from(str, 'utf-8')).digest('base64');
}

async function request<TResponse>(key: string, secret: string, url: string, options: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(options?.headers)

  // Need to be alphabatic order.
  
  let params:PackagistApiParams = {
    'cnonce': uuidv4(),
    'key': key,
    'timestamp': Math.floor((new Date()).getTime() / 1000).toString(),
  }

  if (options?.body) {
    params.body=options.body as string;
  }

  params = ukSort(params) as PackagistApiParams;

  options.method ??= 'GET'

  const signatureString =  `${options.method}\n${apiHost.replace('https://', '')}\n\/${url}\n${(new URLSearchParams(params)).toString()}`;
  const signature = await signHmacSha256(secret, signatureString);
  headers.set('Authorization', `PACKAGIST-HMAC-SHA256 Cnonce=${params.cnonce} Key=${params.key} Timestamp=${params.timestamp} Signature=${signature}`)
  headers.set('Accept', 'application/json')

  options.headers = headers

  return fetch(`${apiHost}/${url}`, options)
    .then(resp => resp.json())
    .then(data => data as TResponse)
}

export async function getAllTokens(key: string, secret: string): Promise<PackagistApiKeyResponse> {
  return request<PackagistApiKeyResponse>(key, secret, 'api/tokens/')
}

export async function deleteToken(key: string, secret: string, tokenId: number): Promise<PackagistApiResponseError | {}> {
  const options = {} as RequestInit;
  options.method = 'DELETE';

  return request<PackagistApiResponseError | {}>(key, secret, `api/tokens/${tokenId}/`, options);
}

export async function createToken(key: string, secret: string, params: PackagistNewTokenParam): Promise<PackagistApiResponseError | {}> {
  const options = {} as RequestInit;
  options.method = 'POST';
  options.body = JSON.stringify(params);
  options.headers = new Headers();
  options.headers.set('Content-Type', 'application/json');

  return request<PackagistApiResponseError | {}>(key, secret, `api/tokens/`, options);
}

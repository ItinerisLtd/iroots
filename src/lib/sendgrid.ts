const apiUrl = 'https://api.sendgrid.com/v3'

type SendGridApiKey = {
  // eslint-disable-next-line camelcase
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
  result: SendGridApiKey[]
  errors: SendGridError[]
}

async function request<TResponse>(token: string, url: string, options: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(options?.headers)
  headers.set('authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')
  options.headers = headers
  options.method ??= 'GET'

  return fetch(`${apiUrl}/${url}`, options)
    .then(resp => resp.json())
    .then(data => data as TResponse)
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

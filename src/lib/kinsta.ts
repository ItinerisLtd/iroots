import {ux} from '@oclif/core'
import {OutputFlags} from '@oclif/core/interfaces'

import {wait} from './misc.js'

const apiUrl = 'https://api.kinsta.com/v2'

type KinstaSiteLabel = {
  id: number
  name: string
}

type KinstaDomain = {
  id: string
  name: string
}

type KinstaEnvironment = {

  cdn_cache_id?: string

  display_name: string
  domains?: KinstaDomain[]
  id: string

  id_edge_cache?: string

  is_blocked: boolean

  is_premium: boolean
  name: string
  primaryDomain?: KinstaDomain

  ssh_connection: {

    ssh_ip: {

      external_ip: string
    }

    ssh_port: number
  }
}

export type KinstaSite = {

  company_id: string

  display_name: string
  environments?: KinstaEnvironment[]
  id: string
  name: string

  site_labels?: KinstaSiteLabel[]
  status?: string
}

type KinstaCompany = {
  sites: KinstaSite[]
}

type KinstaSitesRequest = {
  company: KinstaCompany
}

type KinstaSiteRequest = {
  site: KinstaSite
}

type KinstaEnvironmentsRequest = {
  site: {
    environments: KinstaEnvironment[]
  }
}

type KinstaBasicResponse = {
  message: string
  status: keyof ResponseCodes
}

type KinstaCreateSiteResponse = KinstaBasicResponse & {
  data: {
    idEnv: string
    idSite: string
  }
}

export type ResponseCodes = {
  200: string // Success/Finished/Complete
  202: string // In progress
  404: string // Not found
  429: string // Too many requests
  500: string // Error
  [key: number]: string
}

type KinstaError = {
  data: {
    message: string
    status: keyof ResponseCodes
  }
  error: string
  message: string
  status: keyof ResponseCodes
}

type KinstaOperationResponse = {

  message: string
  operation_id: string
  status: keyof ResponseCodes
}

async function request<TResponse>(token: string, url: string, options: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(options?.headers)
  headers.set('Authorization', `Bearer ${token}`)
  options.headers = headers
  options.method ??= 'GET'

  const response = await fetch(`${apiUrl}/${url}`, options)
  const data = await response.json()
  const statusCode = data.status || response.status
  const retryAfter = Number.parseInt(response.headers.get('retry-after') || '0', 10)
  // const rateLimitLimit = Number.parseInt(response.headers.get('x-ratelimit-limit') || '0', 10)
  const rateLimitRemaining = Number.parseInt(response.headers.get('x-ratelimit-remaining') || '0', 10)
  if (rateLimitRemaining < 5) {
    await wait((retryAfter + 1) * 1000)
  }

  // Too many requests. Wait and try again.
  if (statusCode === 429 || response.statusText.toLowerCase() === 'too many requests') {
    await wait((retryAfter + 1) * 1000)
    return request<TResponse>(token, url, options)
  }

  if (statusCode === 200) {
    return data as TResponse
  }

  if ([401, 404, 500].includes(statusCode)) {
    const kinstaError: KinstaError = data
    if (kinstaError.error) {
      ux.error(kinstaError.error)
    }

    if (data && data.status === 500) {
      ux.error(kinstaError.data.message)
    }

    ux.error(kinstaError.message)
  }

  // The response is still in progress, wait until it is finished.
  if ('operation_id' in data) {
    // Wait 5 seconds to ensure the operation can be queried
    await wait((Math.max(retryAfter, 5)) * 1000)
    const operationStatus = await checkOperationStatus(token, data.operation_id)
    return operationStatus as TResponse
  }

  return data as TResponse
}

export async function getAllSites(token: string, company: string): Promise<KinstaSite[]> {
  const response = await request<KinstaSitesRequest>(token, `sites/?company=${company}`)

  return response.company.sites as KinstaSite[]
}

export async function getSite(token: string, siteId: string): Promise<KinstaSite> {
  const response = await request<KinstaSiteRequest>(token, `sites/${siteId}`)

  return response.site
}

export async function getSiteEnvironments(token: string, siteId: string): Promise<KinstaEnvironment[]> {
  const response = await request<KinstaEnvironmentsRequest>(token, `sites/${siteId}/environments`)

  return response.site.environments
}

type KinstaCloneEnvironmentArgs = {

  display_name: string

  is_premium: boolean

  source_env_id: string
}

export function envNamesToCloneEnvironmentArgs(
  displayNames: string[],
  sourceEnvId: string,
  isPremium: boolean = false,
): KinstaCloneEnvironmentArgs[] {
  return displayNames.map<KinstaCloneEnvironmentArgs>(displayName => ({
      // eslint-disable-next-line camelcase
      display_name: displayName,
      // eslint-disable-next-line camelcase
      is_premium: isPremium,
      // eslint-disable-next-line camelcase
      source_env_id: sourceEnvId,
    }))
}

export async function cloneEnvironment(
  token: string,
  siteId: string,
  args: KinstaCloneEnvironmentArgs,
): Promise<Error | KinstaBasicResponse> {
  const response = await request<KinstaBasicResponse>(token, `sites/${siteId}/environments/clone`, {
    body: JSON.stringify(args),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  return response
}

export function getRegions(): string[] {
  return [
    'asia-east1',
    'asia-east2',
    'asia-northeast1',
    'asia-northeast2',
    'asia-northeast3',
    'asia-south1',
    'asia-south2',
    'asia-southeast1',
    'asia-southeast2',
    'australia-southeast1',
    'australia-southeast2',
    'europe-central2',
    'europe-north1',
    'europe-southwest1',
    'europe-west1',
    'europe-west2',
    'europe-west3',
    'europe-west4',
    'europe-west6',
    'europe-west8',
    'europe-west9',
    'me-west1',
    'northamerica-northeast1',
    'northamerica-northeast2',
    'southamerica-east1',
    'southamerica-west1',
    'us-central1',
    'us-east1',
    'us-east4',
    'us-east5',
    'us-south1',
    'us-west1',
    'us-west2',
    'us-west3',
    'us-west4',
  ]
}

export async function createSite(token: string, args: OutputFlags<any>): Promise<KinstaCreateSiteResponse> {
  const response = await request<KinstaCreateSiteResponse>(token, 'sites/plain', {
    body: JSON.stringify(args),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  return response
}

export async function getOperationStatus(token: string, operationId: string): Promise<KinstaOperationResponse> {
  const response = await request<KinstaOperationResponse>(token, `operations/${operationId}`)

  return response
}

export async function checkOperationStatus<TResponse>(
  apiKey: string,
  operationId: string,
  secondsToWait: number = 5,
): Promise<Error | TResponse> {
  let operationStatus = null
  let operationStatusCode = 404

  do {
    // This is to make sure that Kinsta have created the operation for us to query.
    // If we send the request too soon, it will not be ready to view.
    // eslint-disable-next-line no-await-in-loop
    await wait(secondsToWait * 1000)

    // eslint-disable-next-line no-await-in-loop
    operationStatus = await getOperationStatus(apiKey, operationId)
    operationStatusCode = operationStatus.status
  } while (operationStatusCode !== 200)

  if (operationStatus === null) {
    return new Error('Failed to create site. Try again with MyKinsta UI')
  }

  return operationStatus as TResponse
}

export async function setPhpVersion(
  token: string,
  environmentId: string,
  version: string,
): Promise<KinstaBasicResponse> {
  const response = await request<KinstaBasicResponse>(token, 'sites/tools/modify-php-version', {
    body: JSON.stringify({
      // eslint-disable-next-line camelcase
      environment_id: environmentId,
      // eslint-disable-next-line camelcase
      php_version: version,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PUT',
  })

  return response
}

export async function addDomainToEnvironment(
  token: string,
  environmentId: string,
  args: OutputFlags<any>,
): Promise<KinstaBasicResponse> {
  const response = await request<KinstaBasicResponse>(token, `sites/environments/${environmentId}/domains`, {
    body: JSON.stringify(args),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  return response
}

export async function pushEnvironment(
  token: string,
  siteId: string,
  args: OutputFlags<any>,
): Promise<KinstaBasicResponse> {
  const response = await request<KinstaBasicResponse>(token, `sites/${siteId}/environments`, {
    body: JSON.stringify(args),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PUT',
  })
  return response
}

import {FlagOutput} from '@oclif/core/lib/interfaces/parser.js'

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
  id: string
  name: string
  // eslint-disable-next-line camelcase
  display_name: string
  // eslint-disable-next-line camelcase
  is_premium: boolean
  // eslint-disable-next-line camelcase
  is_blocked: boolean
  // eslint-disable-next-line camelcase
  id_edge_cache?: string
  domains?: KinstaDomain[]
}

export type KinstaSite = {
  id: string
  name: string
  // eslint-disable-next-line camelcase
  display_name: string
  status?: string
  // eslint-disable-next-line camelcase
  company_id: string
  // eslint-disable-next-line camelcase
  site_labels?: KinstaSiteLabel[]
  environments?: KinstaEnvironment[]
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
  // eslint-disable-next-line camelcase
  operation_id: string
  message: string
  status: keyof ResponseCodes
  data: {
    status: keyof ResponseCodes
    message: string
  }
}

export type ResponseCodes = {
  200: string
  202: string
  404: string
  [key: number]: string
}

async function request<TResponse>(token: string, url: string, options: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(options?.headers)
  headers.set('Authorization', `Bearer ${token}`)
  options.headers = headers
  options.method ??= 'GET'

  return fetch(`${apiUrl}/${url}`, options)
    .then(resp => resp.json())
    .then(data => data as TResponse)
}

export async function getAllSites(token: string, company: string): Promise<KinstaSite[]> {
  const response = await request<KinstaSitesRequest>(token, `sites/?company=${company}`)

  return response.company.sites as KinstaSite[]
}

export async function getSite(token: string, siteId: string): Promise<KinstaSite> {
  const response = await request<KinstaSiteRequest>(token, `sites/${siteId}`)

  return response.site as KinstaSite
}

export async function getSiteEnvironments(token: string, siteId: string): Promise<KinstaEnvironment[]> {
  const response = await request<KinstaEnvironmentsRequest>(token, `sites/${siteId}/environments`)

  return response.site.environments
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

export async function createSite(token: string, args: FlagOutput): Promise<KinstaBasicResponse> {
  const response = await request<KinstaBasicResponse>(token, 'sites/plain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  })

  return response
}

export async function getOperationStatus(token: string, operationId: string): Promise<KinstaBasicResponse> {
  return request(token, `operations/${operationId}`)
}

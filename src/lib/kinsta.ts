import { ux } from '@oclif/core'
import { OutputFlags } from '@oclif/core/interfaces'

import { wait } from './misc.js'

const apiUrl = 'https://api.kinsta.com/v2'

type KinstaSiteLabel = {
  id: number
  name: string
}

type KinstaDomain = {
  id: string
  is_active: boolean
  name: string
  site_id: string
  type: string
}

type KinstaContainerInfo = {
  id: string
  php_engine_version: string
}

type KinstaEnvironment = {
  cdn_cache_id?: null | string
  container_info: KinstaContainerInfo

  display_name: string
  domains: KinstaDomain[]
  id: string

  id_edge_cache?: null | string
  image_optimization_type?: null | string
  is_additional_sftp_accounts_enabled: boolean

  is_blocked: boolean
  is_opt_out_from_automatic_php_update?: boolean | null

  is_premium: boolean
  name: string
  primaryDomain?: KinstaDomain

  ssh_connection: {
    ssh_ip: {
      external_ip: string
    }

    ssh_port: number
  }

  web_root?: string
  wordpress_version?: null | string
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

type KinstaSshGetIpAllowlistResponse = {
  environment: {
    active_container: {
      stfp_ip_allowlist: string[]
    }
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
  data?: {
    message: string
    status: keyof ResponseCodes
  }
  error: string
  message: string
  status: keyof ResponseCodes
}

export type KinstaOperationResponse = {
  message: string
  operation_id: string
  status: keyof ResponseCodes
}

export type KinstaBackup = {
  created_at: number
  id: number
  name: string
  note: null | string
  type: string
}

type KinstaBackupsResponse = {
  environment: {
    backups: KinstaBackup[]
    display_name: string
  }
}

type KinstaCompanyUser = {
  email: string
  full_name: string
  id: string
  image: string
}

type KinstaCompanyUsersResponse = {
  company: {
    users: Array<{user: KinstaCompanyUser}>
  }
}

type KinstaSiteDomain = {
  id: string
  name: string
  uses_cloudflare_dns: boolean[]
}
type KinstaDomainsResponse = {
  environment: {
    site_domains: KinstaSiteDomain[]
  }
}

async function request<TResponse>(token: string, url: string, options: RequestInit = {}, timeoutSeconds?: number): Promise<TResponse> {
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

  if ([400, 401, 404, 500].includes(statusCode)) {
    const kinstaError: KinstaError = data
    const errorMessage = kinstaError.error
      || kinstaError.data?.message
      || kinstaError.message
      || JSON.stringify(data)

    ux.error(`Kinsta API error (${statusCode}) on ${url}: ${errorMessage}`)
  }

  // The response is still in progress, wait until it is finished.
  if ('operation_id' in data) {
    // Wait 5 seconds to ensure the operation can be queried
    await wait(Math.max(retryAfter, 5) * 1000)
    const operationStatus = await checkOperationStatus(token, data.operation_id, 2, timeoutSeconds)
    return operationStatus as TResponse
  }

  return data as TResponse
}

export async function getAllSites(
  token: string,
  company: string,
  // eslint-disable-next-line camelcase
  include_environments: boolean,
): Promise<KinstaSite[]> {
  const response = await request<KinstaSitesRequest>(
    token,
    // eslint-disable-next-line camelcase
    `sites/?company=${company}&include_environments=${include_environments}`,
  )

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

const warnedOperations = new Set<string>()

async function pollOperationStatus(token: string, operationId: string): Promise<KinstaOperationResponse> {
  try {
    return await getOperationStatus(token, operationId)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    const statusMatch = message.match(/Kinsta API error \((\d+)\)/)
    const statusCode = statusMatch ? Number(statusMatch[1]) : 0

    // 404 means the operation completed and was cleaned up
    if (statusCode === 404) {
      return { status: 200, message: 'Operation completed' } as unknown as KinstaOperationResponse
    }

    // 500 is transient — operation still running but status temporarily unavailable
    if (statusCode === 500) {
      if (!warnedOperations.has(operationId)) {
        warnedOperations.add(operationId)
        ux.warn(`Operation status temporarily unavailable for ${operationId}, retrying until complete...`)
      }
      /* eslint-disable camelcase */

      return { status: statusCode, operation_id: operationId, message: 'Operation status temporarily unavailable' }
      /* eslint-enable camelcase */
    }

    // Any other error — rethrow
    throw error
  }
}

export async function checkOperationStatus<TResponse>(
  token: string,
  operationId: string,
  secondsToWait: number = 2,
  timeoutSeconds?: number,
): Promise<TResponse> {
  const clampedWait = Math.max(1, Math.min(secondsToWait, 60))
  const timeoutMs = (timeoutSeconds ?? 300) * 1000
  const startTime = Date.now()
  let operationStatus: KinstaOperationResponse | null = null

  do {
    const remainingMs = timeoutMs - (Date.now() - startTime)

    if (remainingMs <= 0) {
      ux.error(`Operation ${operationId} timed out after ${timeoutMs / 1000} seconds`)
    }

    // eslint-disable-next-line no-await-in-loop
    await wait(Math.min(clampedWait * 1000, remainingMs))

    if (Date.now() - startTime >= timeoutMs) {
      ux.error(`Operation ${operationId} timed out after ${timeoutMs / 1000} seconds`)
    }

    // eslint-disable-next-line no-await-in-loop
    operationStatus = await pollOperationStatus(token, operationId)
  } while (operationStatus.status !== 200)

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

export async function getEnvironmentDomains(token: string, envId: string): Promise<KinstaSiteDomain[]> {
  const response = await request<KinstaDomainsResponse>(token, `sites/environments/${envId}/domains`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET',
  })
  return response.environment.site_domains
}

export async function deleteDomainFromEnvironment(
  token: string,
  envId: string,
  args: OutputFlags<any>,
): Promise<KinstaBasicResponse> {
  const response = await request<KinstaBasicResponse>(token, `sites/environments/${envId}/domains`, {
    body: JSON.stringify(args),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'DELETE',
  })
  return response
}

type KinstaVerificationRecord = {
  name: string
  type: string
  value: string
}
type KinstaVerificationRecordsResponse = {
  message?: string
  site_domain: {
    pointing_records: KinstaVerificationRecord[]
    verification_records: KinstaVerificationRecord[]
  }
  status?: number
}

export async function getVerificationRecordsForDomain(
  token: string,
  domainId: string,
): Promise<KinstaVerificationRecordsResponse> {
  const response = await request<KinstaVerificationRecordsResponse>(
    token,
    `sites/environments/domains/${domainId}/verification-records`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    },
  )
  return response
}

export async function setPrimaryDomainOnEnv(
  token: string,
  envId: string,
  args: OutputFlags<any>,
): Promise<KinstaVerificationRecordsResponse> {
  const response = await request<KinstaVerificationRecordsResponse>(
    token,
    `sites/environments/${envId}/change-primary-domain`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
      method: 'PUT',
    },
  )
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
  }, 900)
  return response
}

/* eslint-disable camelcase */
// eslint-disable-next-line max-params
export async function setWebroot(
  token: string,
  env: string,
  web_root_subfolder: string,
  clear_all_cache: boolean = true,
  refresh_plugins_and_themes: boolean = true,
): Promise<KinstaBasicResponse> {
  // Trim the web root subfolder and remove trailing slashes.
  web_root_subfolder = web_root_subfolder.trim().replace(/\/$/, '')
  const response = await request<KinstaBasicResponse>(token, `sites/environments/${env}/change-webroot-subfolder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      web_root_subfolder,
      clear_all_cache,
      refresh_plugins_and_themes,
    }),
  })

  return response
}
/* eslint-enable camelcase */

export async function getSshIpAllowlist(token: string, envId: string): Promise<string[]> {
  const response = await request<KinstaSshGetIpAllowlistResponse>(
    token,
    `sites/environments/${envId}/ssh/get-allowed-ips`,
  )

  return response.environment.active_container.stfp_ip_allowlist
}

/* eslint-disable camelcase */
export async function setSshIpAllowlist(
  token: string,
  envId: string,
  ip_allowlist: string[],
): Promise<KinstaError | null> {
  return request<KinstaError | null>(token, `sites/environments/${envId}/ssh/set-allowed-ips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ip_allowlist,
    }),
  })
  /* eslint-enable camelcase */
}

export async function getBackups(token: string, envId: string): Promise<KinstaBackup[]> {
  const response = await request<KinstaBackupsResponse>(token, `sites/environments/${envId}/backups`)
  return response.environment.backups
}

export async function createManualBackup(
  token: string,
  envId: string,
  tag?: string,
): Promise<KinstaOperationResponse> {
  const response = await request<KinstaOperationResponse>(token, `sites/environments/${envId}/manual-backups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tag === undefined ? {} : {tag}),
  })
  return response
}

/* eslint-disable camelcase */
export async function restoreBackup(
  token: string,
  targetEnvId: string,
  backup_id: number,
  notified_user_id: string,
): Promise<KinstaOperationResponse> {
  const response = await request<KinstaOperationResponse>(
    token,
    `sites/environments/${targetEnvId}/backups/restore`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({backup_id, notified_user_id}),
    },
  )
  return response
}
/* eslint-enable camelcase */

export async function deleteBackup(token: string, backupId: number): Promise<KinstaOperationResponse> {
  const response = await request<KinstaOperationResponse>(token, `sites/environments/backups/${backupId}`, {
    method: 'DELETE',
  })
  return response
}

export async function getCompanyUsers(token: string, companyId: string): Promise<KinstaCompanyUser[]> {
  const response = await request<KinstaCompanyUsersResponse>(token, `company/${companyId}/users`)
  return response.company.users.map(({user}) => user)
}

export const KINSTA_LOG_FILE_NAMES = ['access', 'error', 'kinsta-cache-perf'] as const
export type KinstaLogFileName = (typeof KINSTA_LOG_FILE_NAMES)[number]

type KinstaLogsResponse = {
  environment: {
    container_info: {
      logs: string
    }
  }
}

export async function getLogs(
  token: string,
  envId: string,
  fileName: KinstaLogFileName,
  lines: number,
): Promise<string> {
  const params = new URLSearchParams()
  params.append('file_name', fileName)
  params.append('lines', String(lines))
  const response = await request<KinstaLogsResponse>(
    token,
    `sites/environments/${envId}/logs?${params.toString()}`,
  )
  return response.environment.container_info.logs
}

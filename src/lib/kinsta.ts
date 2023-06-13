const apiUrl = 'https://api.kinsta.com/v2'

type KinstaSiteLabel = {
  id: number
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

async function request<TResponse>(token: string, url: string, options: RequestInit = {}): Promise<TResponse> {
  Object.assign(options, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

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

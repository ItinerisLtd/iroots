const apiUrl = 'https://gateway.stackpath.com'

type StackPathSite = {
  apiUrls: string[]
  createdAt: string
  features: string[]
  id: string
  label: string
  monitoring: string
  stackId: string
  status: string
  updatedAt: string
}

export async function getNewAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const options = {
    body: JSON.stringify({
      // eslint-disable-next-line camelcase
      client_id: clientId,
      // eslint-disable-next-line camelcase
      client_secret: clientSecret,
      // eslint-disable-next-line camelcase
      grant_type: 'client_credentials',
    }),
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    method: 'POST',
  }
  const response = await fetch(`${apiUrl}/identity/v1/oauth2/token`, options)
  const json = await response.json()

  return json.access_token
}

export async function getAllSites(token: string, stackId: string): Promise<StackPathSite[]> {
  const options = {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
    method: 'GET',
  }

  const response = await fetch(`${apiUrl}/delivery/v1/stacks/${stackId}/sites`, options)
  const json = await response.json()

  return json.results as StackPathSite[]
}

export async function getSite(token: string, stackId: string, siteId: string): Promise<StackPathSite> {
  const options = {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
    method: 'GET',
  }

  const response = await fetch(`${apiUrl}/delivery/v1/stacks/${stackId}/sites/${siteId}`, options)
  const json = await response.json()

  return json.site as StackPathSite
}

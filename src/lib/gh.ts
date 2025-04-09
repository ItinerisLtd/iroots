import {execa, Result} from 'execa'

export async function setSecret(key: string, value: string, repo: string, options = {}): Promise<Result> {
  return execa('gh', ['secret', 'set', key, '--body', value, '--repo', repo], options)
}

// eslint-disable-next-line max-params
export async function setDeployKey(
  key: string,
  keyName: string,
  owner: string,
  repo: string,
  options = {},
): Promise<Result> {
  return execa(
    'gh',
    ['api', `repos/${owner}/${repo}/keys`, '-f', `title=${keyName}`, '-f', `key=${key}`, '-f', 'read_only=true'],
    options,
  )
}

export type CreateRepoArgs = {
  teamSlug: string
  teamPermission?: string
}
export async function createRepo(
  owner: string,
  repo: string,
  {teamSlug = 'php-team'}: CreateRepoArgs,
  options = {},
): Promise<Result> {
  return execa('gh', ['repo', 'create', `${owner}/${repo}`, '--private', '--team', teamSlug], options)
}

export async function editRepo(owner: string, repo: string, flag: string, options = {}): Promise<Result> {
  return execa('gh', ['repo', 'edit', `${owner}/${repo}`, `--${flag}`], options)
}

export async function setTeamPermissions(
  owner: string,
  repo: string,
  {teamSlug = 'php-team', teamPermission = 'admin'}: CreateRepoArgs,
  options = {},
): Promise<Result> {
  return execa(
    'gh',
    [
      'api',
      '--method',
      'PUT',
      '-H',
      'Accept: application/vnd.github.v3+json',
      `orgs/${owner}/teams/${teamSlug}/repos/${owner}/${repo}`,
      '-f',
      `permission=${teamPermission}`,
    ],
    options,
  )
}

export async function getRepositoryIdFromName(owner: string, repo: string, options = {}): Promise<string> {
  const {stdout} = await execa(
    'gh',
    ['api', 'graphql', '-f', `query='{repository(owner:"${owner}",name:"${repo}"){id}}'`, '-q', '.data.repository.id'],
    options,
  )

  return stdout.trim()
}

// export async function getActorIdsByName(actor: string, options?: Options): Promise<string> {}

type BranchProtectionOptions = {
  owner: string
  repo: string
  branch: string
  isAdminEnforced: boolean
  requiresApprovingReviews: boolean
  requiresStatusChecks: boolean
  requiresStrictStatusChecks: boolean
}

export async function createBranchProtection(
  {
    owner,
    repo,
    branch,
    isAdminEnforced,
    requiresApprovingReviews,
    requiresStatusChecks,
    requiresStrictStatusChecks,
  }: BranchProtectionOptions,
  options = {},
): Promise<Result> {
  const repoId = await getRepositoryIdFromName(owner, repo, options)
  const query = `
mutation($repositoryId:ID!,$branch:String!,$isAdminEnforced:Boolean!,$requiresApprovingReviews:Boolean!,$requiresStatusChecks:Boolean!,$requiresStrictStatusChecks:Boolean!) {
  createBranchProtectionRule(input: {
    repositoryId: $repositoryId
    pattern: $branch
    isAdminEnforced: $isAdminEnforced
    requiresApprovingReviews: $requiresApprovingReviews
    requiresStatusChecks: $requiresStatusChecks
    requiresStrictStatusChecks: $requiresStrictStatusChecks
  }) { clientMutationId }
}
  `

  return execa(
    'gh',
    [
      'api',
      'graphql',
      '-f',
      `query='${query}'`,
      '-f',
      `repositoryId="${repoId}"`,
      '-f',
      `branch="${branch}"`,
      '-F',
      `isAdminEnforced="${isAdminEnforced}"`,
      '-F',
      `requiresApprovingReviews="${requiresApprovingReviews}"`,
      '-F',
      `requiresStatusChecks="${requiresStatusChecks}"`,
      '-F',
      `requiresStrictStatusChecks="${requiresStrictStatusChecks}"`,
    ],
    options,
  )
}

export async function getOrganizationId(login: string) {
  const query = `
{
  organization(login: "${login}") {
    id
  }
}
`

  const {stdout} = await execa('gh', ['api', 'graphql', '-f', `query=${query}`, '-q', '.data.organization.id'])

  return stdout.trim()
}

export async function getEnterpriseId(slug: string) {
  const query = `
{
  enterprise(slug: "${slug}") {
    id
  }
}
`

  const {stdout} = await execa('gh', ['api', 'graphql', '-f', `query=${query}`, '-q', '.data.enterprise.id'])

  return stdout.trim()
}

export async function createIpAllowListEntry(
  ownerId: string,
  ip: string,
  name: string = '',
  options = {},
): Promise<Result> {
  const query = `
mutation() {
  createIpAllowListEntry(
    input: {
      allowListValue: "${ip}"
      clientMutationId: "iroots"
      isActive: true
      name: "${name}"
      ownerId: "${ownerId}"
    }
  ) {
    clientMutationId
    ipAllowListEntry {
      id
      name
      allowListValue
      createdAt
      updatedAt
    }
  }
}
  `

  return execa('gh', ['api', 'graphql', '-f', `query=${query}`], options)
}

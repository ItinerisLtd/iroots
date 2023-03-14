import {execa, ExecaReturnValue, Options} from 'execa'

export async function setSecret(
  key: string,
  value: string,
  repo: string,
  options?: Options,
): Promise<ExecaReturnValue> {
  return execa('gh', ['secret', 'set', key, '--body', value, '--repo', repo], options)
}

// eslint-disable-next-line max-params
export async function setDeployKey(
  key: string,
  keyName: string,
  owner: string,
  repo: string,
  options?: Options,
): Promise<ExecaReturnValue> {
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
  options?: Options,
): Promise<ExecaReturnValue> {
  return execa('gh', ['repo', 'create', `${owner}/${repo}`, '--private', '--team', teamSlug], options)
}

export async function editRepo(
  owner: string,
  repo: string,
  flag: string,
  options?: Options,
): Promise<ExecaReturnValue> {
  return execa('gh', ['repo', 'edit', `${owner}/${repo}`, `--${flag}`], options)
}

export async function setTeamPermissions(
  owner: string,
  repo: string,
  {teamSlug = 'php-team', teamPermission = 'admin'}: CreateRepoArgs,
  options?: Options,
): Promise<ExecaReturnValue> {
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

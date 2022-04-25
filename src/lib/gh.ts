import * as execa from 'execa'

export async function setSecret(key: string, value: string, repo: string, options?: execa.Options) {
  return execa('gh', ['secret', 'set', key, '--body', value, '--repo', repo], options)
}

export async function setDeployKey(key: string, keyName: string, owner: string, repo: string, options?: execa.Options) {
  return execa('gh', ['api', `repos/${owner}/${repo}/keys`, '-f', `title=${keyName}`, '-f', `key=${key}`, '-f', 'read_only=true'], options)
}

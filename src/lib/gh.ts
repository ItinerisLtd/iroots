import * as execa from 'execa'

export async function setSecret(key: string, value: string, repo: string, options?: execa.Options) {
  return execa('gh', ['secret', 'set', key, '--body', value, '--repo', repo], options)
}

import * as execa from 'execa'

export async function deploy(env: string, site: string, options?: execa.Options) {
  return execa('./bin/deploy.sh', [env, site], options)
}

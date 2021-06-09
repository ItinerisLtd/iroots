import * as execa from 'execa'

export async function install(options?: execa.Options) {
  return execa('composer', ['install'], options)
}

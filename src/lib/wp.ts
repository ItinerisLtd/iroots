import * as execa from 'execa'

export async function dbCreate(options?: execa.Options) {
  return execa('wp', ['db', 'create'], options)
}

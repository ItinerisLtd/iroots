import * as execa from 'execa'

export async function dbExists(options?: execa.Options) {
  try {
    await execa('wp', ['db', 'check'], options)
    return true
  } catch (error) {
    return false
  }
}

export async function dbCreate(options?: execa.Options) {
  return execa('wp', ['db', 'create'], options)
}

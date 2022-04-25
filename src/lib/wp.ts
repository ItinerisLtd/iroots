import * as execa from 'execa'
import cli from 'cli-ux'

export async function dbCreate(options?: execa.Options) {
  try {
    await execa('wp', ['db', 'create'], options)
    return true
  } catch (error) {
    cli.log(error.stderr.substring(error.stdout.indexOf(': ') + 1))
    return false
  }
}

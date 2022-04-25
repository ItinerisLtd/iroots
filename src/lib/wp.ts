import cli from 'cli-ux'
import * as execa from 'execa'

export async function dbCreate(options?: execa.Options) {
  try {
    await execa('wp', ['db', 'create'], options)
    return true
  } catch (error) {
    cli.log(error.stderr.substring(error.stdout.indexOf(': ') + 1))
    return false
  }
}

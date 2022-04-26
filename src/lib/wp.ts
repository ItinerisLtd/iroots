import {CliUx} from '@oclif/core'
import * as execa from 'execa'

export async function dbCreate(options?: execa.Options) {
  try {
    await execa('wp', ['db', 'create'], options)
    return true
  } catch (error) {
    CliUx.ux.log(error.stderr.substring(error.stdout.indexOf(': ') + 1))
    return false
  }
}

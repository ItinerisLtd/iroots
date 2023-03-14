import {ux} from '@oclif/core'
import {execa, ExecaError, Options} from 'execa'

export async function dbCreate(options?: Options): Promise<boolean> {
  try {
    await execa('wp', ['db', 'create'], options)
    return true
  } catch (error: unknown) {
    const execaError = error as ExecaError
    ux.log(execaError.stderr.slice(Math.max(0, execaError.stdout.indexOf(': ') + 1)))
    return false
  }
}

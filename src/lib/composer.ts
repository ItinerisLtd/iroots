import {execa, ExecaReturnValue, Options} from 'execa'

export async function install(options?: Options): Promise<ExecaReturnValue> {
  return execa('composer', ['install'], options)
}

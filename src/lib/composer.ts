import {execa, ExecaReturnValue, Options} from 'execa'

export async function install(options?: Options): Promise<ExecaReturnValue> {
  return execa('composer', ['install'], options)
}

export async function require(dependency: string, flags: string[], options?: Options): Promise<ExecaReturnValue> {
  return execa('composer', ['require', dependency, ...flags], options)
}

export async function remove(dependency: string, flags: string[], options?: Options): Promise<ExecaReturnValue> {
  return execa('composer', ['remove', dependency, ...flags], options)
}

import {execa, Options, Result} from 'execa'

export async function install(options?: Options): Promise<Result> {
  return execa('composer', ['install'], options)
}

export async function require(dependency: string, flags: string[], options?: Options): Promise<Result> {
  return execa('composer', ['require', dependency, ...flags], options)
}

export async function remove(dependency: string, flags: string[], options?: Options): Promise<Result> {
  return execa('composer', ['remove', dependency, ...flags], options)
}

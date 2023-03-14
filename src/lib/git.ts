import {execa, ExecaReturnValue, Options} from 'execa'

type GitCloneArgs = {
  dir: string
  branch: string
  origin?: string
}

export async function clone(
  remote: string,
  {dir = '', branch = 'master', origin = 'origin'}: GitCloneArgs,
  options?: Options,
): Promise<ExecaReturnValue> {
  return execa('git', ['clone', '--branch', branch, '--origin', origin, '--single-branch', remote, dir], options)
}

export async function renameCurrentBranch(newbranch: string, options?: Options): Promise<ExecaReturnValue> {
  return execa('git', ['branch', '-m', newbranch], options)
}

export async function removeRemote(name: string, options?: Options): Promise<ExecaReturnValue> {
  return execa('git', ['remote', 'remove', name], options)
}

export async function addRemote(name: string, url: string, options?: Options): Promise<ExecaReturnValue> {
  return execa('git', ['remote', 'add', name, url], options)
}

export async function add(files: string[], options?: Options): Promise<ExecaReturnValue> {
  return execa('git', ['add', ...files], options)
}

export async function commit(message: string, options?: Options): Promise<ExecaReturnValue> {
  return execa('git', ['commit', '-m', message], options)
}

export async function push(remote: string, branch: string, options?: Options): Promise<ExecaReturnValue> {
  return execa('git', ['push', remote, branch], options)
}

export type Remote = {
  owner: string
  repo: string
}

export async function parseRemote(remote: string): Promise<Remote> {
  const ownerAndRepo = remote
  .replace(/.*github.com(:|\/)/gim, '')
  .replace('.git', '')
  .split('/')

  return {
    owner: ownerAndRepo[0],
    repo: ownerAndRepo[1],
  }
}

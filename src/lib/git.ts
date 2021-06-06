import * as execa from 'execa'

export async function clone(remote: string, {dir = '', branch = 'master', origin = 'origin'}, options?: execa.Options) {
  return execa('git', ['clone', '--branch', branch, '--origin', origin, '--single-branch', remote, dir], options)
}

export async function renameCurrentBranch(newbranch: string, options?: execa.Options) {
  return execa('git', ['branch', '-m', newbranch], options)
}

export async function removeRemote(name: string, options?: execa.Options) {
  return execa('git', ['remote', 'remove', name], options)
}

export async function addRemote(name: string, url: string, options?: execa.Options) {
  return execa('git', ['remote', 'add', name, url], options)
}

export async function add(files: string[], options?: execa.Options) {
  return execa('git', ['add', ...files], options)
}

export async function commit(message: string, options?: execa.Options) {
  return execa('git', ['commit', '-m', message], options)
}

export async function push(remote: string, branch: string, options?: execa.Options) {
  return execa('git', ['push', remote, branch], options)
}

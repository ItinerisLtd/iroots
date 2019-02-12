import * as execa from 'execa'

export async function vaultDecrypt(file: string, options?: execa.Options) {
  return execa('ansible-vault', ['decrypt', file], options)
}

export async function vaultEncrypt(file: string, options?: execa.Options) {
  return execa('ansible-vault', ['encrypt', file], options)
}

export async function galaxyInstall(file: string, options?: execa.Options) {
  return execa('ansible-galaxy', ['install', '-r', file], options)
}

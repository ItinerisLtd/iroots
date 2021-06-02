import * as execa from 'execa'

export async function init(options?: execa.Options) {
  return execa('trellis', ['init'], options);
}

export async function vaultDecrypt(env: string, options?: execa.Options) {
  return execa('trellis', ['vault', 'decrypt', env], options)
}

export async function vaultEncrypt(env: string, options?: execa.Options) {
  return execa('trellis', ['vault', 'encrypt', env], options)
}

export async function galaxyInstall(options?: execa.Options) {
  return execa('trellis', ['galaxy', 'install'], options)
}

export async function deploy(env: string, options?: execa.Options) {
  return execa('trellis', ['deploy', env], options)
}

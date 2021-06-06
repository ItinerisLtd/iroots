import * as execa from 'execa'

export async function init(options?: execa.Options) {
  const subprocess = execa('trellis', ['init'], options);
  // This is to pipe the command output to the main output in realtime.
  subprocess.stdout?.pipe(process.stdout)

  return subprocess
}

export async function vaultDecrypt(env: string, options?: execa.Options) {
  return execa('trellis', ['vault', 'decrypt', env], options)
}

export async function vaultEncrypt(env: string, options?: execa.Options) {
  return execa('trellis', ['vault', 'encrypt', env], options)
}

export async function alias(options?: execa.Options) {
  return execa('trellis', ['alias'], options)
}

export async function galaxyInstall(options?: execa.Options) {
  return execa('trellis', ['galaxy', 'install'], options)
}

export async function deploy(env: string, options?: execa.Options) {
  return execa('trellis', ['deploy', env], options)
}

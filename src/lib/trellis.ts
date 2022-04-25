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

export async function dotenv(options?: execa.Options) {
  return execa('trellis', ['dotenv'], options)
}

export async function valetLink(options?: execa.Options) {
  return execa('trellis', ['valet', 'link'], options)
}

export async function galaxyInstall(options?: execa.Options) {
  return execa('trellis', ['galaxy', 'install'], options)
}

export async function deploy(env: string, options?: execa.Options) {
  const subprocess = execa('trellis', ['deploy', '--verbose', env], options)

  // This is to pipe the command output to the main output in realtime.
  subprocess.stdout?.pipe(process.stdout)

  return subprocess
}

export async function getHosts(options?: execa.Options) {
  const {stdout} = await execa('trellis', ['exec', 'ansible', 'all', '--list-hosts', '--limit', '!development'], options)

  const output = stdout.toString().split('\n')
    .map(host => host.trim())
    .filter(host => '' !== host.trim() && false === host.trim().startsWith('hosts ('))

  return [...output]
}

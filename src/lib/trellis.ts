import {execa, ExecaReturnValue, Options} from 'execa'

export async function init(options?: Options): Promise<ExecaReturnValue> {
  const subprocess = execa('trellis', ['init'], options)
  // This is to pipe the command output to the main output in realtime.
  subprocess.stdout?.pipe(process.stdout)

  return subprocess
}

export async function vaultDecrypt(env: string, options?: Options): Promise<ExecaReturnValue> {
  return execa('trellis', ['vault', 'decrypt', env], options)
}

export async function vaultEncrypt(env: string, options?: Options): Promise<ExecaReturnValue> {
  return execa('trellis', ['vault', 'encrypt', env], options)
}

export async function alias(options?: Options): Promise<ExecaReturnValue> {
  return execa('trellis', ['alias'], options)
}

export async function dotenv(options?: Options): Promise<ExecaReturnValue> {
  return execa('trellis', ['dotenv'], options)
}

export async function valetLink(options?: Options): Promise<ExecaReturnValue> {
  return execa('trellis', ['valet', 'link'], options)
}

export async function galaxyInstall(options?: Options): Promise<ExecaReturnValue> {
  return execa('trellis', ['galaxy', 'install'], options)
}

export async function deploy(env: string, options?: Options): Promise<ExecaReturnValue> {
  const subprocess = execa('trellis', ['deploy', '--verbose', env], options)

  // This is to pipe the command output to the main output in realtime.
  subprocess.stdout?.pipe(process.stdout)

  return subprocess
}

export async function getHosts(options?: Options): Promise<string[]> {
  const {stdout} = await execa(
    'trellis',
    ['exec', 'ansible', 'all', '--list-hosts', '--limit', '!development'],
    options,
  )

  const output = stdout
    .toString()
    .split('\n')
    .map(host => host.trim())
    .filter(host => host.trim() !== '' && host.trim().startsWith('hosts (') === false)

  return [...output]
}

export async function keyGenerate(repo: string, knownHosts: string[], options?: Options): Promise<ExecaReturnValue> {
  return execa(
    'trellis',
    ['key', 'generate', '--repo', repo, '--known-hosts', knownHosts.join(','), '--no-provision'],
    options,
  )
}

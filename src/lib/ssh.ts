import * as execa from 'execa'
import * as fs from 'fs-extra'

export async function keygen(keyFilePath: string, {keyName = 'Trellis deploy'}, options?: execa.Options) {
  await execa('ssh-keygen', ['-t', 'ed25519', '-C', keyName, '-f', keyFilePath, '-P', ''], options)

  return {
    private: fs.readFileSync(keyFilePath, 'utf8'),
    public: fs.readFileSync(`${keyFilePath}.pub`, 'utf8'),
  }
}

export async function keyscan(hosts: string[], options?: execa.Options) {
  const knownHosts: string[] = await Promise.all(hosts.map(async (host): Promise<string> => {
    const {stdout} = await execa('ssh-keyscan', ['-t', 'ed25519', '-H', '-T', '1', host], options)

    return stdout.toString()
  }))

  return knownHosts
}

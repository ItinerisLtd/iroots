import { Flags, ux } from '@oclif/core'

import { KinstaCommand } from '../../../../../lib/commands/kinsta-command.js'
import { setSshIpAllowlist } from '../../../../../lib/kinsta.js'

export default class Set extends KinstaCommand {
  static description = 'Set allowed IPs list'
  static flags = {
    company: Flags.string({
      env: 'IROOTS_KINSTA_COMPANY_ID',
      required: true,
    }),
    // eslint-disable-next-line camelcase
    env_id: Flags.string({
      required: true,
    }),
    ip: Flags.string({
      required: true,
      multiple: true,
      env: 'IROOTS_KINSTA_SSH_IP_ALLOWLIST',
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Set)

    ux.action.start(`Setting allowed IPs list to: ${flags.ip.join(', ')}`)
    await setSshIpAllowlist(flags.apiKey, flags.env_id, flags.ip)
    ux.action.stop()
  }
}

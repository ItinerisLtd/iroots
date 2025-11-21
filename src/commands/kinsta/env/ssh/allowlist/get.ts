import { Flags } from '@oclif/core'

import { KinstaCommand } from '../../../../../lib/commands/kinsta-command.js'
import { getSshIpAllowlist } from '../../../../../lib/kinsta.js'

export default class Get extends KinstaCommand {
  static description = 'Get allowed IPs list'
  static flags = {
    company: Flags.string({
      env: 'IROOTS_KINSTA_COMPANY_ID',
      required: true,
    }),
    // eslint-disable-next-line camelcase
    env_id: Flags.string({
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Get)

    const ipList = await getSshIpAllowlist(flags.apiKey, flags.env_id)
    for (const ip of ipList) console.log(ip)
  }
}

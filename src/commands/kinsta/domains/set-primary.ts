import { Flags, ux } from '@oclif/core'

import { KinstaCommand } from '../../../lib/commands/kinsta-command.js'
import { setPrimaryDomainOnEnv } from '../../../lib/kinsta.js'

export default class SetPrimary extends KinstaCommand {
  static description = 'Set the primary domain on a site environment'
  static flags = {
    // eslint-disable-next-line camelcase
    env_id: Flags.string({
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
      required: true,
    }),
    // eslint-disable-next-line camelcase
    domain_id: Flags.string({
      required: true,
    }),
    // eslint-disable-next-line camelcase
    run_search_and_replace: Flags.boolean({
      default: false,
      allowNo: true,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(SetPrimary)

    ux.action.start('Changing primary site domain')

    const response = await setPrimaryDomainOnEnv(flags.apiKey, flags.env_id, flags)

    ux.action.stop(response.message)
  }
}

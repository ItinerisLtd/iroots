import {Flags} from '@oclif/core'

import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {getEnvironmentDomains} from '../../../lib/kinsta.js'

export default class Get extends KinstaCommand {
  static description = 'Get a list of domains on a site environment'
  static flags = {
    company: Flags.string({
      env: 'IROOTS_KINSTA_COMPANY_ID',
      required: true,
    }),
    // eslint-disable-next-line camelcase
    env_id: Flags.string({
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Get)

    const response = await getEnvironmentDomains(flags.apiKey, flags.env_id)

    console.log(response)
  }
}

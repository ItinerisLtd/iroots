import {Flags, ux} from '@oclif/core'

import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {createSite, getRegions} from '../../../lib/kinsta.js'

export default class New extends KinstaCommand {
  static description = 'Create a new Kinsta site'
static flags = {
    company: Flags.string({
      env: 'IROOTS_KINSTA_COMPANY_ID',
      required: true,
    }),
    // eslint-disable-next-line camelcase
    display_name: Flags.string({
      env: 'IROOTS_KINSTA_DISPLAY_NAME',
      required: true,
    }),
    region: Flags.string({
      default: 'europe-west2',
      options: getRegions(),
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)

    if (flags.display_name.length < 5) {
      this.error('The site name must be between 5 and 32 characters long.')
    }

    ux.action.start('Creating site')

    const response = await createSite(flags.apiKey, flags)

    ux.action.stop(response.message)
  }
}

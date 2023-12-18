import {Flags, ux} from '@oclif/core'
import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {createSite, getRegions} from '../../../lib/kinsta.js'

export default class New extends KinstaCommand {
  static description = 'Create a new Kinsta site'

  static flags = {
    company: Flags.string({
      required: true,
      env: 'IROOTS_KINSTA_COMPANY_ID',
    }),
    // eslint-disable-next-line camelcase
    display_name: Flags.string({
      required: true,
      env: 'IROOTS_KINSTA_DISPLAY_NAME',
    }),
    region: Flags.string({
      required: true,
      options: getRegions(),
      default: 'europe-west2',
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

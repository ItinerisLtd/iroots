import {Flags} from '@oclif/core'
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
    }),
    region: Flags.string({
      required: true,
      options: getRegions(),
      default: 'europe-west2',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)

    const response = await createSite(flags.apiKey, flags)
    if (response?.status !== 202) {
      console.log(response)
      this.error(response.message, {exit: 2})
    }

    this.log(`Site created. Check MyKinsta to check progress.`)
  }
}

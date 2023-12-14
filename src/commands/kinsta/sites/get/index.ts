import {Flags} from '@oclif/core'
import {KinstaCommand} from '../../../../lib/commands/kinsta-command.js'
import {getSite} from '../../../../lib/kinsta.js'
import {inspect} from 'node:util'

export default class Get extends KinstaCommand {
  static description = 'Get information about a Kinsta site'

  static flags = {
    siteId: Flags.string({
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Get)
    const {apiKey, siteId} = flags

    const site = await getSite(apiKey, siteId)
    // Allow console.log to show 4 levels deep.
    inspect.defaultOptions.depth = 4
    console.log(site)
  }
}

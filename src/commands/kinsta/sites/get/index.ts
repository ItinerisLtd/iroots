import {Flags} from '@oclif/core'
import {KinstaCommand} from '../../../../lib/commands/kinsta-command.js'
import {getSite} from '../../../../lib/kinsta.js'

export default class Get extends KinstaCommand {
  static description = 'describe the command here'

  static flags = {
    siteId: Flags.string({
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Get)
    const {apiKey, siteId} = flags

    const site = await getSite(apiKey, siteId)
    console.log(site)
  }
}

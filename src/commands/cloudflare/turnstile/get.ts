// eslint-disable-next-line node/no-missing-import
import {CloudflareCommand} from '../../../lib/commands/cloudflare-command.js'
// eslint-disable-next-line node/no-missing-import
import {getSite} from '../../../lib/cloudflare.js'
import {Flags} from '@oclif/core'

export default class Get extends CloudflareCommand {
  static description = 'describe the command here'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    siteKey: Flags.string({
      description: 'The site key',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Get)
    const {apiKey, account, siteKey} = flags

    const sites = await getSite(apiKey, account, siteKey)
    console.table(sites)
  }
}

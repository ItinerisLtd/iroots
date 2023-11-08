import {Flags} from '@oclif/core'
// eslint-disable-next-line node/no-missing-import
import {CloudflareCommand} from '../../../lib/commands/cloudflare-command.js'
// eslint-disable-next-line node/no-missing-import
import {deleteSite} from '../../../lib/cloudflare.js'

export default class Delete extends CloudflareCommand {
  static description = 'describe the command here'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    siteKey: Flags.string({
      description: 'The site key',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Delete)
    const {apiKey, account, siteKey} = flags

    const sites = await deleteSite(apiKey, account, siteKey)
    console.table(sites)
  }
}

import {Flags} from '@oclif/core'
import {CloudflareCommand} from '../../../lib/commands/cloudflare-command.js'
import {deleteTurnstileWidget} from '../../../lib/cloudflare.js'

export default class Delete extends CloudflareCommand {
  static description = 'Delete a Turnstile instance'

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

    const sites = await deleteTurnstileWidget(apiKey, account, siteKey)
    console.table(sites)
  }
}

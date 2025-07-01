import {CloudflareCommand} from '../../../lib/commands/cloudflare-command.js'
import {getTurnstileWidget} from '../../../lib/cloudflare.js'
import {Flags} from '@oclif/core'

export default class Get extends CloudflareCommand {
  static description = 'Get a Turnstile instance'

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

    const sites = await getTurnstileWidget(apiKey, account, siteKey)
    console.table(sites)
  }
}

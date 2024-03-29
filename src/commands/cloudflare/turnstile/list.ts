import {CloudflareCommand} from '../../../lib/commands/cloudflare-command.js'
import {getAllSites} from '../../../lib/cloudflare.js'

export default class List extends CloudflareCommand {
  static description = 'List Turnstile instances'

  static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const {flags} = await this.parse(List)
    const {apiKey, account} = flags

    const sites = await getAllSites(apiKey, account)
    console.table(sites)
  }
}

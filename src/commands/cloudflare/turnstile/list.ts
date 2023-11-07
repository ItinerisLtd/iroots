import {Flags} from '@oclif/core'
// eslint-disable-next-line node/no-missing-import
import {CloudflareCommand} from '../../../lib/commands/cloudflare-command.js'
// eslint-disable-next-line node/no-missing-import
import {getAllSites} from '../../../lib/cloudflare.js'

export default class List extends CloudflareCommand {
  static description = 'describe the command here'

  static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const {flags} = await this.parse(List)
    const {apiKey, account} = flags

    const sites = await getAllSites(apiKey, account)
    console.table(sites)
  }
}

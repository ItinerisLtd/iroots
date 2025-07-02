import {Flags} from '@oclif/core'

import {listDnsRecords} from '../../../lib/cloudflare.js'
import {CloudflareCommand} from '../../../lib/commands/cloudflare-command.js'

export default class List extends CloudflareCommand {
  static description = 'List DNS records'
static examples = ['<%= config.bin %> <%= command.id %>']
static flags = {
    zoneId: Flags.string({
      description: 'The zone ID to list DNS records in',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(List)
    const {apiKey, zoneId} = flags

    const site = await listDnsRecords(apiKey, zoneId)
    console.table(site)
  }
}

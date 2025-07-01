import {Flags} from '@oclif/core'
import {CloudflareCommand} from '../../../lib/commands/cloudflare-command.js'
import {deleteDnsRecord} from '../../../lib/cloudflare.js'

export default class Delete extends CloudflareCommand {
  static description = 'Delete a DNS record'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    zoneId: Flags.string({
      description: 'The zone ID to delete the DNS record from',
      required: true,
    }),
    recordId: Flags.string({
      description: 'The record ID to delete',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Delete)
    const {apiKey, zoneId, recordId} = flags

    const site = await deleteDnsRecord(apiKey, zoneId, recordId)
    console.table(site)
  }
}

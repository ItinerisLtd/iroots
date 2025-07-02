import {Flags} from '@oclif/core'

import {createDnsRecord} from '../../../lib/cloudflare.js'
import {CloudflareCommand} from '../../../lib/commands/cloudflare-command.js'

export default class New extends CloudflareCommand {
  static description = 'Create a new DNS record'
static examples = ['<%= config.bin %> <%= command.id %>']
static flags = {
    content: Flags.string({
      description: 'Content of the DNS record',
      required: true,
    }),
    name: Flags.string({
      description: 'Name of the DNS record (e.g., foobar.example.com)',
      required: true,
    }),
    proxied: Flags.boolean({
      default: false,
      description: 'Whether the DNS record is proxied through Cloudflare',
    }),
    ttl: Flags.integer({
      default: 1,
      description: 'Time to live for the DNS record in seconds',
    }),
    type: Flags.string({
      description: 'Type of DNS record',
      options: ['A', 'CNAME', 'TXT'],
      required: true,
    }),
    zoneId: Flags.string({
      description: 'The zone ID to create the DNS record in',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)
    const {apiKey, zoneId, ...args} = flags

    const site = await createDnsRecord(apiKey, zoneId, args)
    console.table(site)
  }
}

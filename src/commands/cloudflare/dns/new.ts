import {Flags} from '@oclif/core'
import {CloudflareCommand} from '../../../lib/commands/cloudflare-command.js'
import {createDnsRecord} from '../../../lib/cloudflare.js'

export default class New extends CloudflareCommand {
  static description = 'Create a new DNS record'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    zoneId: Flags.string({
      description: 'The zone ID to create the DNS record in',
      required: true,
    }),
    name: Flags.string({
      description: 'Name of the DNS record (e.g., foobar.example.com)',
      required: true,
    }),
    type: Flags.string({
      description: 'Type of DNS record',
      options: ['A', 'CNAME', 'TXT'],
      required: true,
    }),
    content: Flags.string({
      description: 'Content of the DNS record',
      required: true,
    }),
    proxied: Flags.boolean({
      description: 'Whether the DNS record is proxied through Cloudflare',
      default: false,
    }),
    ttl: Flags.integer({
      description: 'Time to live for the DNS record in seconds',
      default: 1,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)
    const {apiKey, zoneId, ...args} = flags

    const site = await createDnsRecord(apiKey, zoneId, args)
    console.table(site)
  }
}

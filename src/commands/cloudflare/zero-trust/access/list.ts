import { Flags } from '@oclif/core'

import { getListOfZeroTrustAccessApplications } from '../../../../lib/cloudflare.js'
import { CloudflareCommand } from '../../../../lib/commands/cloudflare-command.js'

export default class List extends CloudflareCommand {
  static description = 'Get a list of Zero Trust Access applications'
  static examples = ['<%= config.bin %> <%= command.id %>']
  static flags = {
    zoneId: Flags.string({
      description: 'The zone ID to query',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(List)
    const { apiKey, zoneId } = flags

    const sites = await getListOfZeroTrustAccessApplications(apiKey, zoneId)
    console.table(sites)
  }
}

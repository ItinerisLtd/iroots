import { Flags } from '@oclif/core'

import {
  CloudflareZeroTrustSelfHostedApplication,
  getListOfZeroTrustAccessApplications,
} from '../../../../lib/cloudflare.js'
import { CloudflareCommand } from '../../../../lib/commands/cloudflare-command.js'

export default class List extends CloudflareCommand {
  static description = 'Get a list of Zero Trust Access applications'
  static flags = {
    zoneId: Flags.string({
      description: 'The zone ID to query',
      required: true,
    }),
  }

  public async run(): Promise<CloudflareZeroTrustSelfHostedApplication[]> {
    const { flags } = await this.parse(List)
    const { apiKey, zoneId } = flags

    const apps = await getListOfZeroTrustAccessApplications(apiKey, zoneId)
    for (const app of apps) {
      console.table(app)
    }

    return apps
  }
}

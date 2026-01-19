import { Flags } from '@oclif/core'

import { getListOfZeroTrustAccessPolicies } from '../../../../lib/cloudflare.js'
import { CloudflareCommand } from '../../../../lib/commands/cloudflare-command.js'

export default class List extends CloudflareCommand {
  static description = 'Get a list of Zero Trust Access policies'
  static flags = {
    zoneId: Flags.string({
      description: 'The zone ID to query',
      required: true,
    }),
    appId: Flags.string({
      description: 'The application ID to query',
      required: true,
    }),
  }

  public async run() {
    const { flags } = await this.parse(List)
    const { apiKey, zoneId, appId } = flags
    const policies = await getListOfZeroTrustAccessPolicies(apiKey, zoneId, appId)
    for (const policy of policies) {
      console.table(policy)
    }

    return policies
  }
}

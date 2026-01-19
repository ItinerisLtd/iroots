import { Flags } from '@oclif/core'

import { getZeroTrustAccessPolicy } from '../../../../lib/cloudflare.js'
import { CloudflareCommand } from '../../../../lib/commands/cloudflare-command.js'

export default class Get extends CloudflareCommand {
  static description = 'Get a specific Zero Trust Access policy'
  static flags = {
    zoneId: Flags.string({
      description: 'The zone ID',
      required: true,
    }),
    appId: Flags.string({
      description: 'The application ID',
      required: true,
    }),
    policyId: Flags.string({
      description: 'The policy ID to fetch',
      required: true,
    }),
  }

  public async run() {
    const { flags } = await this.parse(Get)
    const { apiKey, zoneId, appId, policyId } = flags
    const policy = await getZeroTrustAccessPolicy(apiKey, zoneId, appId, policyId)
    console.table(policy)
    return policy
  }
}

import { Flags } from '@oclif/core'

import { createZeroTrustAccessPolicy } from '../../../../lib/cloudflare.js'
import { CloudflareCommand } from '../../../../lib/commands/cloudflare-command.js'

export default class New extends CloudflareCommand {
  static description = 'Create a new Zero Trust Access policy'
  static flags = {
    zoneId: Flags.string({
      description: 'The zone ID to use',
      required: true,
    }),
    appId: Flags.string({
      description: 'The application ID',
      required: true,
    }),
    name: Flags.string({
      description: 'The name of the policy',
      required: true,
    }),
    precedence: Flags.integer({
      description: 'The precedence of the policy',
      required: true,
    }),
    decision: Flags.string({
      description: 'The decision for the policy',
      required: true,
      options: ['allow', 'deny', 'bypass', 'non_identity'],
    }),
    sessionDuration: Flags.string({
      description: 'Session duration (e.g. 24h)',
      required: false,
    }),
  }

  public async run() {
    const { flags } = await this.parse(New)
    const { apiKey, zoneId, appId, ...policyArgs } = flags
    const policy = await createZeroTrustAccessPolicy(apiKey, zoneId, appId, policyArgs)
    console.table(policy)
    return policy
  }
}

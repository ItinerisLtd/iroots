import { Flags } from '@oclif/core'

import { deleteZeroTrustAccessPolicy } from '../../../../lib/cloudflare.js'
import { CloudflareCommand } from '../../../../lib/commands/cloudflare-command.js'

export default class Delete extends CloudflareCommand {
  static description = 'Delete a Zero Trust Access policy'
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
      description: 'The policy ID to delete',
      required: true,
    }),
  }

  public async run() {
    const { flags } = await this.parse(Delete)
    const { apiKey, zoneId, appId, policyId } = flags
    await deleteZeroTrustAccessPolicy(apiKey, zoneId, appId, policyId)
    this.log(`Deleted Zero Trust Access policy: ${policyId}`)
  }
}

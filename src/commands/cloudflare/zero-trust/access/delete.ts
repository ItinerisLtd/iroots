import { Flags } from '@oclif/core'

import { deleteZeroTrustAccessApplication } from '../../../../lib/cloudflare.js'
import { CloudflareCommand } from '../../../../lib/commands/cloudflare-command.js'

export default class Delete extends CloudflareCommand {
  static description = 'Delete a Zero Trust Access application'
  static flags = {
    zoneId: Flags.string({
      description: 'The zone ID',
      required: true,
    }),
    appId: Flags.string({
      description: 'The application ID to delete',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Delete)
    const { apiKey, zoneId, appId } = flags
    await deleteZeroTrustAccessApplication(apiKey, zoneId, appId)
    this.log(`Deleted Zero Trust Access application: ${appId}`)
  }
}

import { Flags } from '@oclif/core'

import { CloudflareZeroTrustSelfHostedApplication, getZeroTrustAccessApplication } from '../../../../lib/cloudflare.js'
import { CloudflareCommand } from '../../../../lib/commands/cloudflare-command.js'

export default class Get extends CloudflareCommand {
  static description = 'Get a specific Zero Trust Access application'
  static flags = {
    zoneId: Flags.string({
      description: 'The zone ID',
      required: true,
    }),
    appId: Flags.string({
      description: 'The application ID to fetch',
      required: true,
    }),
  }

  public async run(): Promise<CloudflareZeroTrustSelfHostedApplication> {
    const { flags } = await this.parse(Get)
    const { apiKey, zoneId, appId } = flags
    const app = await getZeroTrustAccessApplication(apiKey, zoneId, appId)
    console.table(app)
    return app
  }
}

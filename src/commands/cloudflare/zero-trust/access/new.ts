import { Flags } from '@oclif/core'

import { CloudflareZeroTrustSelfHostedApplication, createZeroTrustAccessApplication } from '../../../../lib/cloudflare.js'
import { CloudflareCommand } from '../../../../lib/commands/cloudflare-command.js'

export default class New extends CloudflareCommand {
  static description = 'Create a new Zero Trust Access application'
  static flags = {
    zoneId: Flags.string({
      description: 'The zone ID to use',
      required: true,
    }),
    name: Flags.string({
      description: 'The name of the application',
      required: true,
    }),
    domain: Flags.string({
      description: 'The domain for the application',
      required: true,
    }),
    type: Flags.string({
      description: 'The application type',
      required: true,
      options: ['self_hosted', 'saas', 'ssh', 'vnc', 'rdp', 'app_launcher', 'bookmark', 'git_ssh', 'warp', 'browser_isolation'],
      default: 'self_hosted',
    }),
  }

  public async run(): Promise<CloudflareZeroTrustSelfHostedApplication> {
    const { flags } = await this.parse(New)
    const { apiKey, zoneId, ...appFlags } = flags
    const app = await createZeroTrustAccessApplication(apiKey, zoneId, appFlags)
    console.table(app)
    return app
  }
}

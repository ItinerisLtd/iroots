import {Flags} from '@oclif/core'

import {StackPathCommand} from '../../../lib/commands/stackpath-command.js'
import {getNewAccessToken, getSite} from '../../../lib/stackpath.js'

export default class GetSite extends StackPathCommand {
  static description = 'Get an individual site'
static examples = ['<%= config.bin %> <%= command.id %>']
static flags = {
    siteId: Flags.string({
      description: 'The site ID',
      env: 'IROOTS_STACKPATH_SITE_ID',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(GetSite)
    const {clientId, clientSecret, siteId, stackId} = flags

    const token = await getNewAccessToken(clientId, clientSecret)
    if (!token) {
      this.error('Could not get a new access token')
    }

    const site = await getSite(token, stackId, siteId)
    console.table([site])
  }
}

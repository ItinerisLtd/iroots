import {getNewAccessToken, getSite} from '../../../lib/stackpath.js'
import {StackPathCommand} from '../../../lib/commands/StackPathCommand.js'
import {Flags} from '@oclif/core'

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
    const {clientId, clientSecret, stackId, siteId} = flags

    const token = await getNewAccessToken(clientId, clientSecret)
    if (!token) {
      this.error('Could not get a new access token')
    }

    const site = await getSite(token, stackId, siteId)
    console.table([site])
  }
}

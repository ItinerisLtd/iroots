import {getAllSites, getNewAccessToken} from '../../../lib/stackpath.js'
import {StackPathCommand} from '../../../lib/commands/StackPathCommand.js'

export default class GetAllSites extends StackPathCommand {
  static description = 'Get list of all sites'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {}

  public async run(): Promise<void> {
    const {flags} = await this.parse(GetAllSites)
    const {clientId, clientSecret, stackId} = flags

    const token = await getNewAccessToken(clientId, clientSecret)
    if (!token) {
      this.error('Could not get a new access token')
    }

    const siteIds = await getAllSites(token, stackId)
    console.table(siteIds)
  }
}

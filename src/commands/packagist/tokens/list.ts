import {PackagistCommand} from '../../../lib/commands/packagist-command.js'
import {getAllTokens} from '../../../lib/packagist.js'

export default class List extends PackagistCommand {
  static description = 'List all the tokens'
static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const {flags} = await this.parse(List)
    const {apiKey, apiSecret} = flags

    const response = await getAllTokens(apiKey, apiSecret)
    if ('status' in response) {
      console.table(response.status)
      this.exit(1)
    }

    console.table(response)
  }
}

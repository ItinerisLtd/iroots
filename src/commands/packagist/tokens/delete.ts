import {Flags} from '@oclif/core'
import {PackagistCommand} from '../../../lib/commands/packagist-command.js'
import {deleteToken} from '../../../lib/packagist.js'

export default class Delete extends PackagistCommand {
  static description = 'The ID of the token we want to delete'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    tokenId: Flags.integer({
      description: 'The token ID',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Delete)
    const {apiKey, apiSecret, tokenId} = flags

    const response = await deleteToken(apiKey, apiSecret, tokenId)
    if ('status' in response) {
      console.table(response)
      this.exit(1)
    }

    this.log('Token deleted successfully.')
  }
}

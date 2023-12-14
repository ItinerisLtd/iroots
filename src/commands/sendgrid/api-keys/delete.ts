import {Flags} from '@oclif/core'
import {SendGridCommand} from '../../../lib/commands/sendgrid-command.js'
import {deleteApiKey} from '../../../lib/sendgrid.js'

export default class Delete extends SendGridCommand {
  static description = 'Delete an API key'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    apiKeyId: Flags.string({
      description: 'The API key ID',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Delete)
    const {apiKey, apiKeyId} = flags

    const response = await deleteApiKey(apiKey, apiKeyId)
    if (Array.isArray(response)) {
      console.table(response)
      this.exit(1)
    }

    this.log('API Key deleted successfully.')
  }
}

import {Flags} from '@oclif/core'

import {SendGridCommand} from '../../../lib/commands/sendgrid-command.js'
import {getApiKey} from '../../../lib/sendgrid.js'

export default class Get extends SendGridCommand {
  static description = 'Get information about an API key'
static examples = ['<%= config.bin %> <%= command.id %>']
static flags = {
    apiKeyId: Flags.string({
      description: 'The API key ID',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Get)
    const {apiKey, apiKeyId} = flags

    const key = await getApiKey(apiKey, apiKeyId)
    if (key.errors) {
      console.table(key.errors)
      this.exit(1)
    }

    this.log(`Key Name: ${key.name}`)
    this.log(`API Key ID: ${key.api_key_id}`)
    this.log('Scopes:')
    this.log(key.scopes.join(', '))
  }
}

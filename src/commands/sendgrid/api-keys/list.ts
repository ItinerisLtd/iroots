import {Flags} from '@oclif/core'

import {SendGridCommand} from '../../../lib/commands/sendgrid-command.js'
import {getAllApiKeys} from '../../../lib/sendgrid.js'

export default class List extends SendGridCommand {
  static description = 'List API keys in SendGrid account'
static examples = ['<%= config.bin %> <%= command.id %>']
static flags = {
    limit: Flags.integer({
      default: 0,
      description: 'Specifies the number of results to be returned by the API.',
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(List)
    const {apiKey, limit} = flags

    const response = await getAllApiKeys(apiKey, limit)
    if (response.errors) {
      console.table(response.errors)
      this.exit(1)
    }

    console.table(response.result)
  }
}

import {Flags} from '@oclif/core'
import {SendGridCommand} from '../../../lib/commands/sendgrid-command.js'
import {createApiKey} from '../../../lib/sendgrid.js'

export default class New extends SendGridCommand {
  static description = 'describe the command here'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    name: Flags.string({
      description: 'The name you will use to describe this API Key.',
      required: true,
    }),
    scopes: Flags.string({
      description:
        'The individual permissions that you are giving to this API Key. See https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/authorization#table-of-contents for available scopes.',
      multiple: true,
      required: true,
      default: ['mail.send'],
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)
    const {apiKey, name, scopes} = flags

    const response = await createApiKey(apiKey, name, scopes)
    console.log(response)
  }
}

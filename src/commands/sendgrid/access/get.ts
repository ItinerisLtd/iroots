import {Flags} from '@oclif/core'
import {SendGridCommand} from '../../../lib/commands/sendgrid-command.js'
import {getAllAllowedIp} from '../../../lib/sendgrid.js'

export default class Get extends SendGridCommand {
  static description = 'Retrieve a specific allowed IP'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    // eslint-disable-next-line camelcase
    rule_id: Flags.string({
      description: 'the IP rule Id',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Get)
    const response = await getAllAllowedIp(flags.apiKey, flags.rule_id)
    console.table(response.result)
  }
}

import {SendGridCommand} from '../../../lib/commands/sendgrid-command.js'
import {getAllAllowedIps} from '../../../lib/sendgrid.js'

export default class List extends SendGridCommand {
  static description = 'List allowed IPs in SendGrid account'

  static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const {flags} = await this.parse(List)
    const {apiKey} = flags

    const response = await getAllAllowedIps(apiKey)
    console.table(response.result)
  }
}

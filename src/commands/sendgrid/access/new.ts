import {Flags} from '@oclif/core'

import {SendGridCommand} from '../../../lib/commands/sendgrid-command.js'
import {addAllowedIps} from '../../../lib/sendgrid.js'

export default class New extends SendGridCommand {
  static description = 'Add one or more IPs to the allow list'
static examples = ['<%= config.bin %> <%= command.id %>']
static flags = {
    ip: Flags.string({
      description: 'the IP address to whitelist',
      multiple: true,
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)
    const response = await addAllowedIps(flags.apiKey, flags.ip)
    console.table(response.result)
  }
}

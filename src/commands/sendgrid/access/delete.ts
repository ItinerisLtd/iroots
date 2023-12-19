import {Flags} from '@oclif/core'
import {SendGridCommand} from '../../../lib/commands/sendgrid-command.js'
import {deleteAllowedIps} from '../../../lib/sendgrid.js'

export default class Delete extends SendGridCommand {
  static description = 'Remove one or more IPs from the allow list'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    // eslint-disable-next-line camelcase
    rule_id: Flags.string({
      description: 'the IP rule Id',
      required: true,
      multiple: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Delete)
    if (!(await deleteAllowedIps(flags.apiKey, flags.rule_id))) {
      this.error('failed')
    }

    this.log(`Deleted ${flags.rule_id.join(' ')}`)
  }
}

import {Flags} from '@oclif/core'
import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {getAllSites} from '../../../lib/kinsta.js'

export default class List extends KinstaCommand {
  static description = 'List sites in Kinsta account'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    company: Flags.string({
      required: true,
      env: 'IROOTS_KINSTA_COMPANY_ID',
    }),
    format: Flags.string({
      required: false,
      default: 'table',
      options: ['json', 'table'],
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(List)
    const {apiKey, company, format} = flags

    const sites = await getAllSites(apiKey, company)
    if (format === 'json') {
      console.log(JSON.stringify(sites))
    } else {
      console.table(sites)
    }
  }
}

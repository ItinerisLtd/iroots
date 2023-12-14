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
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(List)
    const {apiKey, company} = flags

    const sites = await getAllSites(apiKey, company)
    console.table(sites)
  }
}

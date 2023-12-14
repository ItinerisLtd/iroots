import {Flags} from '@oclif/core'
import {StatusCakeUptimeStatus, getAllUptimes} from '../../../lib/statuscake.js'
import {StatusCakeCommand} from '../../../lib/commands/statuscake-command.js'

export default class List extends StatusCakeCommand {
  static description = 'List uptime monitors'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    status: Flags.string({
      description: 'Uptime check status',
      options: ['up', 'down'],
      default: 'up',
    }),
    page: Flags.integer({
      description: 'Page of results',
      default: 1,
    }),
    limit: Flags.integer({
      description: 'Page of results',
      default: 25,
      max: 100,
    }),
    tags: Flags.string({
      description: 'Comma separated list of tags assocaited with a check',
      multiple: true,
      default: [],
    }),
    matchany: Flags.boolean({
      description: 'Include uptime checks in response that match any specified tag or all tags',
      default: false,
    }),
    nouptime: Flags.boolean({
      description: 'Do not calculate uptime percentages for results',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(List)
    const {apiKey, status, page, limit, tags, matchany, nouptime} = flags

    const list = await getAllUptimes(apiKey, {
      status: status as StatusCakeUptimeStatus,
      page,
      limit,
      tags,
      matchany,
      nouptime,
    })
    console.table(list)
  }
}

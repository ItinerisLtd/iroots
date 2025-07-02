import {Flags} from '@oclif/core'

import {StatusCakeCommand} from '../../../lib/commands/statuscake-command.js'
import {getAllUptimes, StatusCakeUptimeStatus} from '../../../lib/statuscake.js'

export default class List extends StatusCakeCommand {
  static description = 'List uptime monitors'
static examples = ['<%= config.bin %> <%= command.id %>']
static flags = {
    limit: Flags.integer({
      default: 25,
      description: 'Page of results',
      max: 100,
    }),
    matchany: Flags.boolean({
      default: false,
      description: 'Include uptime checks in response that match any specified tag or all tags',
    }),
    nouptime: Flags.boolean({
      default: false,
      description: 'Do not calculate uptime percentages for results',
    }),
    page: Flags.integer({
      default: 1,
      description: 'Page of results',
    }),
    status: Flags.string({
      default: 'up',
      description: 'Uptime check status',
      options: ['up', 'down'],
    }),
    tags: Flags.string({
      default: [],
      description: 'Comma separated list of tags assocaited with a check',
      multiple: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(List)
    const {apiKey, limit, matchany, nouptime, page, status, tags} = flags

    const list = await getAllUptimes(apiKey, {
      limit,
      matchany,
      nouptime,
      page,
      status: status as StatusCakeUptimeStatus,
      tags,
    })
    console.table(list)
  }
}

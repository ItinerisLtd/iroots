import {Flags} from '@oclif/core'

import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {getBackups} from '../../../lib/kinsta.js'

export default class List extends KinstaCommand {
  static description = 'List backups for a Kinsta environment'
  static examples = ['<%= config.bin %> <%= command.id %>']
  static flags = {
    // eslint-disable-next-line camelcase
    environment_id: Flags.string({
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
      required: true,
    }),
    format: Flags.string({
      default: 'table',
      options: ['json', 'table'],
      required: false,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(List)
    // eslint-disable-next-line camelcase
    const {apiKey, environment_id, format} = flags

    const backups = await getBackups(apiKey, environment_id)

    if (format === 'json') {
      console.log(JSON.stringify(backups))
    } else {
      const rows = backups.map(b => ({
        id: b.id,
        name: b.name,
        type: b.type,
        note: b.note ?? '',
        // eslint-disable-next-line camelcase
        created_at: new Date(b.created_at).toISOString(),
      }))
      console.table(rows)
    }
  }
}

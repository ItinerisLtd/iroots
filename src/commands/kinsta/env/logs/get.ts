import {Flags} from '@oclif/core'

import {KinstaCommand} from '../../../../lib/commands/kinsta-command.js'
import {getLogs, KinstaLogFileName} from '../../../../lib/kinsta.js'

export default class Get extends KinstaCommand {
  static description = 'Fetch logs for a Kinsta environment'
  static examples = ['<%= config.bin %> <%= command.id %>']
  static flags = {
    // eslint-disable-next-line camelcase
    environment_id: Flags.string({
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
      required: true,
    }),
    // eslint-disable-next-line camelcase
    file_name: Flags.string({
      default: 'error',
      options: ['access', 'error', 'kinsta-cache-perf'],
      required: true,
    }),
    format: Flags.string({
      default: 'text',
      options: ['json', 'text'],
      required: false,
    }),
    lines: Flags.integer({
      default: 1000,
      max: 20_000,
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Get)
    // eslint-disable-next-line camelcase
    const {apiKey, environment_id, file_name, format, lines} = flags

    // eslint-disable-next-line camelcase
    const logs = await getLogs(apiKey, environment_id, file_name as KinstaLogFileName, lines)

    if (format === 'json') {
      console.log(JSON.stringify({logs}))
    } else {
      console.log(logs)
    }
  }
}

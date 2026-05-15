import {Flags, ux} from '@oclif/core'

import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {createManualBackup} from '../../../lib/kinsta.js'

export default class Create extends KinstaCommand {
  static description = 'Create a manual backup for a Kinsta environment'
  static examples = ['<%= config.bin %> <%= command.id %>']
  static flags = {
    // eslint-disable-next-line camelcase
    environment_id: Flags.string({
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
      required: true,
    }),
    tag: Flags.string({
      description: 'Optional tag to identify the backup',
      required: false,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Create)
    // eslint-disable-next-line camelcase
    const {apiKey, environment_id, tag} = flags

    ux.action.start('Creating manual backup')

    const response = await createManualBackup(apiKey, environment_id, tag)

    ux.action.stop(response.message)
  }
}

import {confirm} from '@inquirer/prompts'
import {Flags, ux} from '@oclif/core'

import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {deleteBackup} from '../../../lib/kinsta.js'

export default class Delete extends KinstaCommand {
  static description = 'Delete a Kinsta environment backup'
  static examples = ['<%= config.bin %> <%= command.id %>']
  static flags = {
    // eslint-disable-next-line camelcase
    backup_id: Flags.integer({
      description: 'The ID of the backup to delete (see: kinsta backups list)',
      required: true,
    }),
    IConfirmBackupWillBeDeletedPermanently: Flags.boolean({
      description: 'Skip the interactive confirmation prompt',
      required: false,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Delete)
    // eslint-disable-next-line camelcase
    const {apiKey, backup_id} = flags

    if (!flags.IConfirmBackupWillBeDeletedPermanently) {
      const confirmed = await confirm({
        // eslint-disable-next-line camelcase
        message: `Permanently delete backup ${backup_id}? This cannot be undone.`,
      })
      if (!confirmed) {
        this.exit(0)
      }
    }

    // eslint-disable-next-line camelcase
    ux.action.start(`Deleting backup ${backup_id}`)

    const response = await deleteBackup(apiKey, backup_id)

    ux.action.stop(response.message)
  }
}

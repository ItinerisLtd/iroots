import {confirm, select} from '@inquirer/prompts'
import {Flags, ux} from '@oclif/core'

import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {getCompanyUsers, restoreBackup} from '../../../lib/kinsta.js'

export default class Restore extends KinstaCommand {
  static description = 'Restore a backup to a Kinsta environment'
  static examples = ['<%= config.bin %> <%= command.id %>']
  static flags = {
    // eslint-disable-next-line camelcase
    backup_id: Flags.integer({
      description: 'The ID of the backup to restore (see: kinsta backups list)',
      required: true,
    }),
    company: Flags.string({
      description: 'Company ID — required when --notified_user_id is not provided',
      env: 'IROOTS_KINSTA_COMPANY_ID',
      required: false,
    }),
    // eslint-disable-next-line camelcase
    environment_id: Flags.string({
      description: 'The ID of the target environment to restore the backup into',
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
      required: true,
    }),
    IConfirmBackupWillOverwriteEnvironment: Flags.boolean({
      description: 'Skip the interactive confirmation prompt',
      required: false,
    }),
    // eslint-disable-next-line camelcase
    notified_user_id: Flags.string({
      description: 'UUID of the Kinsta user to notify when restore completes. If omitted, you will be prompted to select a user.',
      required: false,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Restore)
    // eslint-disable-next-line camelcase
    const {apiKey, backup_id, company, environment_id, notified_user_id} = flags

    // eslint-disable-next-line camelcase
    let resolvedUserId = notified_user_id

    if (resolvedUserId === undefined) {
      if (company === undefined) {
        this.error('--company is required when --notified_user_id is not provided')
      }

      ux.action.start('Fetching company users')
      const users = await getCompanyUsers(apiKey, company)
      ux.action.stop()

      if (users.length === 0) {
        this.error('No company users found. Provide --notified_user_id explicitly.')
      }

      resolvedUserId = await select({
        message: 'Select the user to notify when restore completes:',
        choices: users.map(u => ({name: `${u.full_name} (${u.email})`, value: u.id})),
      })
    }

    if (flags.IConfirmBackupWillOverwriteEnvironment !== true) {
      const confirmed = await confirm({
        // eslint-disable-next-line camelcase
        message: `Restoring backup ${backup_id} will overwrite environment ${environment_id}. Continue?`,
      })
      if (!confirmed) {
        this.exit(0)
      }
    }

    // eslint-disable-next-line camelcase
    ux.action.start(`Restoring backup ${backup_id}`)

    const response = await restoreBackup(apiKey, environment_id, backup_id, resolvedUserId)

    ux.action.stop(response.message)
  }
}

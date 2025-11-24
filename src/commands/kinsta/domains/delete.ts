import { Flags, ux } from '@oclif/core'

import { KinstaCommand } from '../../../lib/commands/kinsta-command.js'
import { deleteDomainFromEnvironment } from '../../../lib/kinsta.js'

export default class Delete extends KinstaCommand {
  static description = 'Delete a domain on a site environment'
  static flags = {
    // eslint-disable-next-line camelcase
    domain_ids: Flags.string({
      required: true,
      multiple: true,
    }),
    // eslint-disable-next-line camelcase
    env_id: Flags.string({
      env: 'IROOTS_KINSTA_ENVIRONMENT_ID',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Delete)

    if (flags.domain_ids.length === 1) {
      ux.action.start(`Deleting domain`)
    } else if (flags.domain_ids.length > 1) {
      ux.action.start(`Deleting ${flags.domain_ids.length} domains`)
    }

    const response = await deleteDomainFromEnvironment(flags.apiKey, flags.env_id, flags)

    ux.action.stop(response.message)
  }
}

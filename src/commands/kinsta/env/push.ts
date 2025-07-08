import {Flags, ux} from '@oclif/core'

import {KinstaCommand} from '../../../lib/commands/kinsta-command.js'
import {getSiteEnvironments, pushEnvironment} from '../../../lib/kinsta.js'

export default class Push extends KinstaCommand {
  static description = 'Push an existing environment'
  static flags = {
    company: Flags.string({
      env: 'IROOTS_KINSTA_COMPANY_ID',
      required: true,
    }),
    // eslint-disable-next-line camelcase
    site_id: Flags.string({
      required: true,
    }),
    // eslint-disable-next-line camelcase
    source_env_id: Flags.string({
      required: true,
    }),
    // eslint-disable-next-line camelcase
    target_env_id: Flags.string({
      required: true,
    }),
    // eslint-disable-next-line camelcase
    push_db: Flags.boolean({
      allowNo: true,
      default: true,
    }),
    // eslint-disable-next-line camelcase
    push_files: Flags.boolean({
      allowNo: true,
      default: true,
    }),
    // eslint-disable-next-line camelcase
    push_files_option: Flags.string({
      default: 'ALL_FILES',
      options: ['ALL_FILES', 'SPECIFIC_FILES'],
    }),
    // eslint-disable-next-line camelcase
    file_list: Flags.string({
      multiple: true,
      relationships: [
        {
          type: 'all',
          flags: [
            {
              name: 'push_files_option',
              when: async (flags) => flags.push_files_option === 'SPECIFIC_FILES',
            }
          ],
        }
      ],
    }),
    // eslint-disable-next-line camelcase
    search_and_replace: Flags.boolean({
      allowNo: true,
      default: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Push)

    const environments = await getSiteEnvironments(flags.apiKey, flags.site_id)
    const sourceEnvName = environments.find((env) => env.id === flags.source_env_id)?.display_name
    const targetEnvName = environments.find((env) => env.id === flags.target_env_id)?.display_name

    ux.action.start(`Pushing environment "${sourceEnvName}" to "${targetEnvName}"`)

    const response = await pushEnvironment(flags.apiKey, flags.site_id, flags)

    ux.action.stop(response.message)
  }
}

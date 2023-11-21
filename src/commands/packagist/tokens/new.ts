import {Flags} from '@oclif/core'
import {PackagistCommand} from '../../../lib/commands/packagist-command.js'
import {createToken} from '../../../lib/packagist.js'
import type {PackagistNewTokenParam} from '../../../lib/packagist.js';

export default class New extends PackagistCommand {
  static description = 'Create new token'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    description: Flags.string({
      description: 'The description to explain where the token is used.',
      required: true,
    }),
    access: Flags.string({
      description: 'Type of access the token will have. only read or update',
      required: true,
      default: 'read',
    }),
    accessToAllPackages: Flags.boolean({
      description: 'Flag indicating whether the token has access to all packages',
      required: false,
    }),
    teamId: Flags.integer({
      description: 'The team id to define which packages the token has access to. Example 1',
      required: false,
    }),
    expiresAt: Flags.string({
      description: 'Time at which the token expires. Example: 2023-11-20T11:36:00+00:00',
      required: false,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)
    const {apiKey, apiSecret, ...params} = flags;

    console.log(flags);
    const response = await createToken(apiKey, apiSecret, params as PackagistNewTokenParam)
    console.table(response);
  }
}

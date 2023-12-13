import {Flags, ux} from '@oclif/core'
import {PackagistCommand} from '../../../lib/commands/packagist-command.js'
import {regenerateToken} from '../../../lib/packagist.js'
import type {PackagistRegenerateTokenParam} from '../../../lib/packagist.js'

export default class New extends PackagistCommand {
  static description = 'Regenerate a token'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    IConfirmOldTokenWillStopWorkingImmediately: Flags.boolean({
      description: 'The required confirmation field',
      required: false,
    }),
    tokenId: Flags.integer({
      description: 'The ID of token we want to regenerate.',
      required: true,
    }),
    expiresAt: Flags.string({
      description: 'Time at which the token expires. Example: 2023-11-20T11:36:00+00:00',
      required: false,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)
    const {apiKey, apiSecret, ...params} = flags
    if (!params.IConfirmOldTokenWillStopWorkingImmediately) {
      const answer = (await ux.prompt(`Are you sure you wish to regenerate token ${flags.tokenId}? [y/n]`)) as string
      params.IConfirmOldTokenWillStopWorkingImmediately = /y(?:es)?|1/i.test(answer)
    }

    const response = await regenerateToken(apiKey, apiSecret, params as PackagistRegenerateTokenParam)
    console.table(response)
  }
}

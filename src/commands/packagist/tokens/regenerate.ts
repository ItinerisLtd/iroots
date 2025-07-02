import {confirm} from '@inquirer/prompts'
import {Flags} from '@oclif/core'

import type {PackagistRegenerateTokenParam} from '../../../lib/packagist.js'

import {PackagistCommand} from '../../../lib/commands/packagist-command.js'
import {regenerateToken} from '../../../lib/packagist.js'

export default class New extends PackagistCommand {
  static description = 'Regenerate a token'
static examples = ['<%= config.bin %> <%= command.id %>']
static flags = {
    expiresAt: Flags.string({
      description: 'Time at which the token expires. Example: 2023-11-20T11:36:00+00:00',
      required: false,
    }),
    IConfirmOldTokenWillStopWorkingImmediately: Flags.boolean({
      description: 'The required confirmation field',
      required: false,
    }),
    tokenId: Flags.integer({
      description: 'The ID of token we want to regenerate.',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(New)
    const {apiKey, apiSecret, ...params} = flags
    if (!params.IConfirmOldTokenWillStopWorkingImmediately) {
      const answer = await confirm({message: `Are you sure you wish to regenerate token ${flags.tokenId}? [y/n]`})
      params.IConfirmOldTokenWillStopWorkingImmediately = answer
    }

    if (!params.IConfirmOldTokenWillStopWorkingImmediately) {
      this.error('You must confirm that the old token will stop working immediately.')
    }

    const response = await regenerateToken(apiKey, apiSecret, params as PackagistRegenerateTokenParam)
    if (response.status === 'error') {
      this.error(`Error regenerating token: ${response.message}`)
    }

    console.table(response)
  }
}

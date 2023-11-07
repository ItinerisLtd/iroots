import {Command, Flags} from '@oclif/core'

export abstract class CloudflareCommand extends Command {
  static examples = ['<%= config.bin %> <%= command.id %>']

  static baseFlags = {
    apiKey: Flags.string({
      description: 'The API key',
      env: 'IROOTS_CLOUDFLARE_API_KEY',
      required: true,
    }),
    account: Flags.string({
      description: 'The account identifier',
      required: true,
      env: 'IROOTS_CLOUDFLARE_ACCOUNT_ID',
    }),
  }
}

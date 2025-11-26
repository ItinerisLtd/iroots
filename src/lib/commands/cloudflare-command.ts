import { Command, Flags } from '@oclif/core'

export abstract class CloudflareCommand extends Command {
  static baseFlags = {
    account: Flags.string({
      description: 'The account identifier',
      env: 'IROOTS_CLOUDFLARE_ACCOUNT_ID',
      required: true,
    }),
    apiKey: Flags.string({
      description: 'The API key',
      env: 'IROOTS_CLOUDFLARE_API_KEY',
      required: true,
    }),
  }
  static description = 'Cloudflare Turnstile API commands'
  public static enableJsonFlag = true
  static examples = ['<%= config.bin %> <%= command.id %>']
}

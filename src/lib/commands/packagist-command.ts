import {Command, Flags} from '@oclif/core'

export abstract class PackagistCommand extends Command {
  static baseFlags = {
    apiKey: Flags.string({
      description: 'The API key',
      env: 'IROOTS_PACKAGIST_API_KEY',
      required: true,
    }),
    apiSecret: Flags.string({
      description: 'The API SECRET',
      env: 'IROOTS_PACKAGIST_API_SECRET',
      required: true,
    }),
  }
static examples = ['<%= config.bin %> <%= command.id %>']
}

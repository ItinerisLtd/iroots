import {Command, Flags} from '@oclif/core'

export abstract class SentryCommand extends Command {
  static baseFlags = {
    apiKey: Flags.string({
      description: 'The API key',
      env: 'IROOTS_SENTRY_API_KEY',
      required: true,
    }),
  }
static examples = ['<%= config.bin %> <%= command.id %>']
}

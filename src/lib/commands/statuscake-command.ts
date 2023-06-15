import {Command, Flags} from '@oclif/core'

export abstract class StatusCakeCommand extends Command {
  static examples = ['<%= config.bin %> <%= command.id %>']

  static baseFlags = {
    apiKey: Flags.string({
      description: 'The API key',
      env: 'IROOTS_STATUSCAKE_API_KEY',
      required: true,
    }),
  }
}

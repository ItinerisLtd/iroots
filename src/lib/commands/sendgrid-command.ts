import {Command, Flags} from '@oclif/core'

export abstract class SendGridCommand extends Command {
  static examples = ['<%= config.bin %> <%= command.id %>']

  static baseFlags = {
    apiKey: Flags.string({
      description: 'The API key',
      env: 'IROOTS_SENDGRID_API_KEY',
      required: true,
    }),
  }
}

import {Command, Flags} from '@oclif/core'

export abstract class StackPathCommand extends Command {
  static examples = ['<%= config.bin %> <%= command.id %>']

  static baseFlags = {
    clientId: Flags.string({
      description: 'The API client ID',
      env: 'IROOTS_STACKPATH_CLIENT_ID',
      required: true,
    }),
    clientSecret: Flags.string({
      description: 'The API client Secret',
      env: 'IROOTS_STACKPATH_CLIENT_SECRET',
      required: true,
    }),
    stackId: Flags.string({
      description: 'The Stack ID',
      env: 'IROOTS_STACKPATH_STACK_ID',
      required: true,
    }),
  }
}

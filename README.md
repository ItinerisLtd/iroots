iroots
======

A CLI to manage Trellis projects

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/iroots.svg)](https://npmjs.org/package/iroots)
[![Downloads/week](https://img.shields.io/npm/dw/iroots.svg)](https://npmjs.org/package/iroots)
[![License](https://img.shields.io/npm/l/iroots.svg)](https://github.com/itinerisltd/iroots/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g iroots
$ iroots COMMAND
running command...
$ iroots (-v|--version|version)
iroots/0.0.0 darwin-x64 node-v10.15.1
$ iroots --help [COMMAND]
USAGE
  $ iroots COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`iroots hello [FILE]`](#iroots-hello-file)
* [`iroots help [COMMAND]`](#iroots-help-command)

## `iroots hello [FILE]`

describe the command here

```
USAGE
  $ iroots hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ iroots hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/hello.ts)_

## `iroots help [COMMAND]`

display help for iroots

```
USAGE
  $ iroots help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_
<!-- commandsstop -->

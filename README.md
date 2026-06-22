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
$ iroots (--version|-h)
iroots/0.0.0 linux-x64 node-v18.19.0
$ iroots --help [COMMAND]
USAGE
  $ iroots COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`iroots cloudflare dns delete`](#iroots-cloudflare-dns-delete)
* [`iroots cloudflare dns list`](#iroots-cloudflare-dns-list)
* [`iroots cloudflare dns new`](#iroots-cloudflare-dns-new)
* [`iroots cloudflare turnstile delete`](#iroots-cloudflare-turnstile-delete)
* [`iroots cloudflare turnstile get`](#iroots-cloudflare-turnstile-get)
* [`iroots cloudflare turnstile list`](#iroots-cloudflare-turnstile-list)
* [`iroots cloudflare turnstile new`](#iroots-cloudflare-turnstile-new)
* [`iroots cloudflare zero-trust access delete`](#iroots-cloudflare-zero-trust-access-delete)
* [`iroots cloudflare zero-trust access get`](#iroots-cloudflare-zero-trust-access-get)
* [`iroots cloudflare zero-trust access list`](#iroots-cloudflare-zero-trust-access-list)
* [`iroots cloudflare zero-trust access new`](#iroots-cloudflare-zero-trust-access-new)
* [`iroots help [COMMAND]`](#iroots-help-command)
* [`iroots kinsta backups create`](#iroots-kinsta-backups-create)
* [`iroots kinsta backups delete`](#iroots-kinsta-backups-delete)
* [`iroots kinsta backups list`](#iroots-kinsta-backups-list)
* [`iroots kinsta backups restore`](#iroots-kinsta-backups-restore)
* [`iroots kinsta domains delete`](#iroots-kinsta-domains-delete)
* [`iroots kinsta domains get`](#iroots-kinsta-domains-get)
* [`iroots kinsta domains new`](#iroots-kinsta-domains-new)
* [`iroots kinsta domains records`](#iroots-kinsta-domains-records)
* [`iroots kinsta domains set-primary`](#iroots-kinsta-domains-set-primary)
* [`iroots kinsta env logs get`](#iroots-kinsta-env-logs-get)
* [`iroots kinsta env open`](#iroots-kinsta-env-open)
* [`iroots kinsta env push`](#iroots-kinsta-env-push)
* [`iroots kinsta env ssh allowlist get`](#iroots-kinsta-env-ssh-allowlist-get)
* [`iroots kinsta env ssh allowlist set`](#iroots-kinsta-env-ssh-allowlist-set)
* [`iroots kinsta env webroot`](#iroots-kinsta-env-webroot)
* [`iroots kinsta operations get`](#iroots-kinsta-operations-get)
* [`iroots kinsta sites get`](#iroots-kinsta-sites-get)
* [`iroots kinsta sites get environments`](#iroots-kinsta-sites-get-environments)
* [`iroots kinsta sites list`](#iroots-kinsta-sites-list)
* [`iroots kinsta sites new`](#iroots-kinsta-sites-new)
* [`iroots kinsta sites tools php-version-set`](#iroots-kinsta-sites-tools-php-version-set)
* [`iroots new`](#iroots-new)
* [`iroots packagist tokens delete`](#iroots-packagist-tokens-delete)
* [`iroots packagist tokens list`](#iroots-packagist-tokens-list)
* [`iroots packagist tokens new`](#iroots-packagist-tokens-new)
* [`iroots packagist tokens regenerate`](#iroots-packagist-tokens-regenerate)
* [`iroots plugins`](#iroots-plugins)
* [`iroots plugins add PLUGIN`](#iroots-plugins-add-plugin)
* [`iroots plugins:inspect PLUGIN...`](#iroots-pluginsinspect-plugin)
* [`iroots plugins install PLUGIN`](#iroots-plugins-install-plugin)
* [`iroots plugins link PATH`](#iroots-plugins-link-path)
* [`iroots plugins remove [PLUGIN]`](#iroots-plugins-remove-plugin)
* [`iroots plugins reset`](#iroots-plugins-reset)
* [`iroots plugins uninstall [PLUGIN]`](#iroots-plugins-uninstall-plugin)
* [`iroots plugins unlink [PLUGIN]`](#iroots-plugins-unlink-plugin)
* [`iroots plugins update`](#iroots-plugins-update)
* [`iroots sendgrid access delete`](#iroots-sendgrid-access-delete)
* [`iroots sendgrid access get`](#iroots-sendgrid-access-get)
* [`iroots sendgrid access list`](#iroots-sendgrid-access-list)
* [`iroots sendgrid access new`](#iroots-sendgrid-access-new)
* [`iroots sendgrid api-keys delete`](#iroots-sendgrid-api-keys-delete)
* [`iroots sendgrid api-keys get`](#iroots-sendgrid-api-keys-get)
* [`iroots sendgrid api-keys list`](#iroots-sendgrid-api-keys-list)
* [`iroots sendgrid api-keys new`](#iroots-sendgrid-api-keys-new)
* [`iroots sentry projects delete`](#iroots-sentry-projects-delete)
* [`iroots sentry projects get`](#iroots-sentry-projects-get)
* [`iroots sentry projects keys list`](#iroots-sentry-projects-keys-list)
* [`iroots sentry projects list`](#iroots-sentry-projects-list)
* [`iroots sentry projects new`](#iroots-sentry-projects-new)
* [`iroots stackpath sites get`](#iroots-stackpath-sites-get)
* [`iroots stackpath sites list`](#iroots-stackpath-sites-list)
* [`iroots statuscake uptime delete`](#iroots-statuscake-uptime-delete)
* [`iroots statuscake uptime get`](#iroots-statuscake-uptime-get)
* [`iroots statuscake uptime list`](#iroots-statuscake-uptime-list)
* [`iroots statuscake uptime new`](#iroots-statuscake-uptime-new)

## `iroots cloudflare dns delete`

Delete a DNS record

```
USAGE
  $ iroots cloudflare dns delete --account <value> --apiKey <value> --recordId <value> --zoneId <value> [--json]

FLAGS
  --account=<value>   (required) [env: IROOTS_CLOUDFLARE_ACCOUNT_ID] The account identifier
  --apiKey=<value>    (required) [env: IROOTS_CLOUDFLARE_API_KEY] The API key
  --recordId=<value>  (required) The record ID to delete
  --zoneId=<value>    (required) The zone ID to delete the DNS record from

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Delete a DNS record

EXAMPLES
  $ iroots cloudflare dns delete
```

_See code: [src/commands/cloudflare/dns/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/dns/delete.ts)_

## `iroots cloudflare dns list`

List DNS records

```
USAGE
  $ iroots cloudflare dns list --account <value> --apiKey <value> --zoneId <value> [--json]

FLAGS
  --account=<value>  (required) [env: IROOTS_CLOUDFLARE_ACCOUNT_ID] The account identifier
  --apiKey=<value>   (required) [env: IROOTS_CLOUDFLARE_API_KEY] The API key
  --zoneId=<value>   (required) The zone ID to list DNS records in

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List DNS records

EXAMPLES
  $ iroots cloudflare dns list
```

_See code: [src/commands/cloudflare/dns/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/dns/list.ts)_

## `iroots cloudflare dns new`

Create a new DNS record

```
USAGE
  $ iroots cloudflare dns new --account <value> --apiKey <value> --content <value> --name <value> --type A|CNAME|TXT
    --zoneId <value> [--json] [--proxied] [--ttl <value>]

FLAGS
  --account=<value>  (required) [env: IROOTS_CLOUDFLARE_ACCOUNT_ID] The account identifier
  --apiKey=<value>   (required) [env: IROOTS_CLOUDFLARE_API_KEY] The API key
  --content=<value>  (required) Content of the DNS record
  --name=<value>     (required) Name of the DNS record (e.g., foobar.example.com)
  --proxied          Whether the DNS record is proxied through Cloudflare
  --ttl=<value>      [default: 1] Time to live for the DNS record in seconds
  --type=<option>    (required) Type of DNS record
                     <options: A|CNAME|TXT>
  --zoneId=<value>   (required) The zone ID to create the DNS record in

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Create a new DNS record

EXAMPLES
  $ iroots cloudflare dns new
```

_See code: [src/commands/cloudflare/dns/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/dns/new.ts)_

## `iroots cloudflare turnstile delete`

Delete a Turnstile instance

```
USAGE
  $ iroots cloudflare turnstile delete --account <value> --apiKey <value> --siteKey <value> [--json]

FLAGS
  --account=<value>  (required) [env: IROOTS_CLOUDFLARE_ACCOUNT_ID] The account identifier
  --apiKey=<value>   (required) [env: IROOTS_CLOUDFLARE_API_KEY] The API key
  --siteKey=<value>  (required) The site key

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Delete a Turnstile instance

EXAMPLES
  $ iroots cloudflare turnstile delete
```

_See code: [src/commands/cloudflare/turnstile/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/turnstile/delete.ts)_

## `iroots cloudflare turnstile get`

Get a Turnstile instance

```
USAGE
  $ iroots cloudflare turnstile get --account <value> --apiKey <value> --siteKey <value> [--json]

FLAGS
  --account=<value>  (required) [env: IROOTS_CLOUDFLARE_ACCOUNT_ID] The account identifier
  --apiKey=<value>   (required) [env: IROOTS_CLOUDFLARE_API_KEY] The API key
  --siteKey=<value>  (required) The site key

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Get a Turnstile instance

EXAMPLES
  $ iroots cloudflare turnstile get
```

_See code: [src/commands/cloudflare/turnstile/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/turnstile/get.ts)_

## `iroots cloudflare turnstile list`

List Turnstile instances

```
USAGE
  $ iroots cloudflare turnstile list --account <value> --apiKey <value> [--json]

FLAGS
  --account=<value>  (required) [env: IROOTS_CLOUDFLARE_ACCOUNT_ID] The account identifier
  --apiKey=<value>   (required) [env: IROOTS_CLOUDFLARE_API_KEY] The API key

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List Turnstile instances

EXAMPLES
  $ iroots cloudflare turnstile list
```

_See code: [src/commands/cloudflare/turnstile/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/turnstile/list.ts)_

## `iroots cloudflare turnstile new`

Create a new Turnstile instance

```
USAGE
  $ iroots cloudflare turnstile new --account <value> --apiKey <value> --domains <value>... --mode
    non-interactive|invisible|managed [--json] [--bot_fight_mode] [--clearance_level <value>] [--name <value>]
    [--offlabel] [--region <value>]

FLAGS
  --account=<value>          (required) [env: IROOTS_CLOUDFLARE_ACCOUNT_ID] The account identifier
  --apiKey=<value>           (required) [env: IROOTS_CLOUDFLARE_API_KEY] The API key
  --bot_fight_mode           If bot_fight_mode is set to true, Cloudflare issues computationally expensive challenges in
                             response to malicious bots (ENT only).
  --clearance_level=<value>  [default: no_clearance] If Turnstile is embedded on a Cloudflare site and the widget should
                             grant challenge clearance, this setting can determine the clearance level to be set
  --domains=<value>...       (required)
  --mode=<option>            (required) [default: managed] Widget Mode
                             <options: non-interactive|invisible|managed>
  --name=<value>             >= 1 characters <= 254 characters
  --offlabel                 Do not show any Cloudflare branding on the widget (ENT only)
  --region=<value>           [default: world] Region where this widget can be used

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Create a new Turnstile instance

EXAMPLES
  $ iroots cloudflare turnstile new

FLAG DESCRIPTIONS
  --name=<value>  >= 1 characters <= 254 characters

    Human readable widget name. Not unique. Cloudflare suggests that you set this to a meaningful string to make it
    easier to identify your widget, and where it is used. >= 1 characters <= 254 characters
```

_See code: [src/commands/cloudflare/turnstile/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/turnstile/new.ts)_

## `iroots cloudflare zero-trust access delete`

Delete a Zero Trust Access application

```
USAGE
  $ iroots cloudflare zero-trust access delete --account <value> --apiKey <value> --zoneId <value> --appId <value>
  [--json]

FLAGS
  --account=<value>  (required) [env: IROOTS_CLOUDFLARE_ACCOUNT_ID] The account identifier
  --apiKey=<value>   (required) [env: IROOTS_CLOUDFLARE_API_KEY] The API key
  --appId=<value>    (required) The application ID to delete
  --zoneId=<value>   (required) The zone ID

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Delete a Zero Trust Access application

EXAMPLES
  $ iroots cloudflare zero-trust access delete
```

_See code: [src/commands/cloudflare/zero-trust/access/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/zero-trust/access/delete.ts)_

## `iroots cloudflare zero-trust access get`

Get a specific Zero Trust Access application

```
USAGE
  $ iroots cloudflare zero-trust access get --account <value> --apiKey <value> --zoneId <value> --appId <value> [--json]

FLAGS
  --account=<value>  (required) [env: IROOTS_CLOUDFLARE_ACCOUNT_ID] The account identifier
  --apiKey=<value>   (required) [env: IROOTS_CLOUDFLARE_API_KEY] The API key
  --appId=<value>    (required) The application ID to fetch
  --zoneId=<value>   (required) The zone ID

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Get a specific Zero Trust Access application

EXAMPLES
  $ iroots cloudflare zero-trust access get
```

_See code: [src/commands/cloudflare/zero-trust/access/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/zero-trust/access/get.ts)_

## `iroots cloudflare zero-trust access list`

Get a list of Zero Trust Access applications

```
USAGE
  $ iroots cloudflare zero-trust access list --account <value> --apiKey <value> --zoneId <value> [--json]

FLAGS
  --account=<value>  (required) [env: IROOTS_CLOUDFLARE_ACCOUNT_ID] The account identifier
  --apiKey=<value>   (required) [env: IROOTS_CLOUDFLARE_API_KEY] The API key
  --zoneId=<value>   (required) The zone ID to query

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Get a list of Zero Trust Access applications

EXAMPLES
  $ iroots cloudflare zero-trust access list
```

_See code: [src/commands/cloudflare/zero-trust/access/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/zero-trust/access/list.ts)_

## `iroots cloudflare zero-trust access new`

Create a new Zero Trust Access application

```
USAGE
  $ iroots cloudflare zero-trust access new --account <value> --apiKey <value> --zoneId <value> --name <value> --domain <value> --type
    self_hosted|saas|ssh|vnc|rdp|app_launcher|bookmark|git_ssh|warp|browser_isolation [--json]

FLAGS
  --account=<value>  (required) [env: IROOTS_CLOUDFLARE_ACCOUNT_ID] The account identifier
  --apiKey=<value>   (required) [env: IROOTS_CLOUDFLARE_API_KEY] The API key
  --domain=<value>   (required) The domain for the application
  --name=<value>     (required) The name of the application
  --type=<option>    (required) [default: self_hosted] The application type
                     <options: self_hosted|saas|ssh|vnc|rdp|app_launcher|bookmark|git_ssh|warp|browser_isolation>
  --zoneId=<value>   (required) The zone ID to use

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Create a new Zero Trust Access application

EXAMPLES
  $ iroots cloudflare zero-trust access new
```

_See code: [src/commands/cloudflare/zero-trust/access/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/zero-trust/access/new.ts)_

## `iroots help [COMMAND]`

Display help for iroots.

```
USAGE
  $ iroots help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for iroots.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/6.2.50/src/commands/help.ts)_

## `iroots kinsta backups create`

Create a manual backup for a Kinsta environment

```
USAGE
  $ iroots kinsta backups create --apiKey <value> --environment_id <value> [--tag <value>]

FLAGS
  --apiKey=<value>          (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --environment_id=<value>  (required) [env: IROOTS_KINSTA_ENVIRONMENT_ID]
  --tag=<value>             Optional tag to identify the backup

DESCRIPTION
  Create a manual backup for a Kinsta environment

EXAMPLES
  $ iroots kinsta backups create
```

_See code: [src/commands/kinsta/backups/create.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/backups/create.ts)_

## `iroots kinsta backups delete`

Delete a Kinsta environment backup

```
USAGE
  $ iroots kinsta backups delete --apiKey <value> --backup_id <value> [--IConfirmBackupWillBeDeletedPermanently]

FLAGS
  --IConfirmBackupWillBeDeletedPermanently  Skip the interactive confirmation prompt
  --apiKey=<value>                          (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --backup_id=<value>                       (required) The ID of the backup to delete (see: kinsta backups list)

DESCRIPTION
  Delete a Kinsta environment backup

EXAMPLES
  $ iroots kinsta backups delete
```

_See code: [src/commands/kinsta/backups/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/backups/delete.ts)_

## `iroots kinsta backups list`

List backups for a Kinsta environment

```
USAGE
  $ iroots kinsta backups list --apiKey <value> --environment_id <value> [--format json|table]

FLAGS
  --apiKey=<value>          (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --environment_id=<value>  (required) [env: IROOTS_KINSTA_ENVIRONMENT_ID]
  --format=<option>         [default: table]
                            <options: json|table>

DESCRIPTION
  List backups for a Kinsta environment

EXAMPLES
  $ iroots kinsta backups list
```

_See code: [src/commands/kinsta/backups/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/backups/list.ts)_

## `iroots kinsta backups restore`

Restore a backup to a Kinsta environment

```
USAGE
  $ iroots kinsta backups restore --apiKey <value> --backup_id <value> --environment_id <value> [--company <value>]
    [--IConfirmBackupWillOverwriteEnvironment] [--notified_user_id <value>]

FLAGS
  --IConfirmBackupWillOverwriteEnvironment  Skip the interactive confirmation prompt
  --apiKey=<value>                          (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --backup_id=<value>                       (required) The ID of the backup to restore (see: kinsta backups list)
  --company=<value>                         [env: IROOTS_KINSTA_COMPANY_ID] Company ID — required when
                                            --notified_user_id is not provided
  --environment_id=<value>                  (required) [env: IROOTS_KINSTA_ENVIRONMENT_ID] The ID of the target
                                            environment to restore the backup into
  --notified_user_id=<value>                UUID of the Kinsta user to notify when restore completes. If omitted, you
                                            will be prompted to select a user.

DESCRIPTION
  Restore a backup to a Kinsta environment

EXAMPLES
  $ iroots kinsta backups restore
```

_See code: [src/commands/kinsta/backups/restore.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/backups/restore.ts)_

## `iroots kinsta domains delete`

Delete a domain on a site environment

```
USAGE
  $ iroots kinsta domains delete --apiKey <value> --domain_ids <value>... --env_id <value>

FLAGS
  --apiKey=<value>         (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --domain_ids=<value>...  (required)
  --env_id=<value>         (required) [env: IROOTS_KINSTA_ENVIRONMENT_ID]

DESCRIPTION
  Delete a domain on a site environment

EXAMPLES
  $ iroots kinsta domains delete
```

_See code: [src/commands/kinsta/domains/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/domains/delete.ts)_

## `iroots kinsta domains get`

Get a list of domains on a site environment

```
USAGE
  $ iroots kinsta domains get --apiKey <value> --company <value> --env_id <value>

FLAGS
  --apiKey=<value>   (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --company=<value>  (required) [env: IROOTS_KINSTA_COMPANY_ID]
  --env_id=<value>   (required) [env: IROOTS_KINSTA_ENVIRONMENT_ID]

DESCRIPTION
  Get a list of domains on a site environment

EXAMPLES
  $ iroots kinsta domains get
```

_See code: [src/commands/kinsta/domains/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/domains/get.ts)_

## `iroots kinsta domains new`

Create a new domain on a site environment

```
USAGE
  $ iroots kinsta domains new --apiKey <value> --company <value> --domain_name <value> --env_id <value>
    [--custom_ssl_cert <value>] [--custom_ssl_key <value>] [--is_wildcardless]

FLAGS
  --apiKey=<value>           (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --company=<value>          (required) [env: IROOTS_KINSTA_COMPANY_ID]
  --custom_ssl_cert=<value>
  --custom_ssl_key=<value>
  --domain_name=<value>      (required)
  --env_id=<value>           (required) [env: IROOTS_KINSTA_ENVIRONMENT_ID]
  --is_wildcardless

DESCRIPTION
  Create a new domain on a site environment

EXAMPLES
  $ iroots kinsta domains new
```

_See code: [src/commands/kinsta/domains/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/domains/new.ts)_

## `iroots kinsta domains records`

Get verification records for a domain on a site environment

```
USAGE
  $ iroots kinsta domains records --apiKey <value> --site_domain_id <value>

FLAGS
  --apiKey=<value>          (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --site_domain_id=<value>  (required)

DESCRIPTION
  Get verification records for a domain on a site environment

EXAMPLES
  $ iroots kinsta domains records
```

_See code: [src/commands/kinsta/domains/records.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/domains/records.ts)_

## `iroots kinsta domains set-primary`

Set the primary domain on a site environment

```
USAGE
  $ iroots kinsta domains set-primary --apiKey <value> --env_id <value> --domain_id <value> [--run_search_and_replace]

FLAGS
  --apiKey=<value>               (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --domain_id=<value>            (required)
  --env_id=<value>               (required) [env: IROOTS_KINSTA_ENVIRONMENT_ID]
  --[no-]run_search_and_replace

DESCRIPTION
  Set the primary domain on a site environment

EXAMPLES
  $ iroots kinsta domains set-primary
```

_See code: [src/commands/kinsta/domains/set-primary.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/domains/set-primary.ts)_

## `iroots kinsta env logs get`

Fetch logs for a Kinsta environment

```
USAGE
  $ iroots kinsta env logs get --apiKey <value> --environment_id <value> --file_name access|error|kinsta-cache-perf
    --lines <value> [--format json|text]

FLAGS
  --apiKey=<value>          (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --environment_id=<value>  (required) [env: IROOTS_KINSTA_ENVIRONMENT_ID]
  --file_name=<option>      (required) [default: error]
                            <options: access|error|kinsta-cache-perf>
  --format=<option>         [default: text]
                            <options: json|text>
  --lines=<value>           (required) [default: 1000]

DESCRIPTION
  Fetch logs for a Kinsta environment

EXAMPLES
  $ iroots kinsta env logs get
```

_See code: [src/commands/kinsta/env/logs/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/env/logs/get.ts)_

## `iroots kinsta env open`

Open a Kinsta environment in your default web browser

```
USAGE
  $ iroots kinsta env open --apiKey <value> [--company <value>] [--environment <value>] [--environment_id <value>]
    [--site <value>] [--site_id <value>]

FLAGS
  --apiKey=<value>          (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --company=<value>         [env: IROOTS_KINSTA_COMPANY_ID] Kinsta company ID (required when site/environment IDs are
                            not resolved directly)
  --environment=<value>     Environment name (case-insensitive exact match)
  --environment_id=<value>  [env: IROOTS_KINSTA_ENVIRONMENT_ID] Environment ID (takes priority over inferred values)
  --site=<value>            Site name (case-insensitive exact match)
  --site_id=<value>         Site ID (takes priority over inferred values)

DESCRIPTION
  Open a Kinsta environment in your default web browser

EXAMPLES
  $ iroots kinsta env open
```

_See code: [src/commands/kinsta/env/open.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/env/open.ts)_

## `iroots kinsta env push`

Push an existing environment

```
USAGE
  $ iroots kinsta env push --apiKey <value> [--company <value>] [--site <value>] [--site_id <value>] [--source_env
    <value>] [--source_env_id <value>] [--target_env <value>] [--target_env_id <value>] [--push_db] [--push_files]
    [--push_files_option ALL_FILES|SPECIFIC_FILES] [--file_list <value>...] [--search_and_replace]

FLAGS
  --apiKey=<value>              (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --company=<value>             [env: IROOTS_KINSTA_COMPANY_ID]
  --file_list=<value>...
  --[no-]push_db
  --[no-]push_files
  --push_files_option=<option>  [default: ALL_FILES]
                                <options: ALL_FILES|SPECIFIC_FILES>
  --[no-]search_and_replace
  --site=<value>
  --site_id=<value>
  --source_env=<value>
  --source_env_id=<value>
  --target_env=<value>
  --target_env_id=<value>

DESCRIPTION
  Push an existing environment

EXAMPLES
  $ iroots kinsta env push
```

_See code: [src/commands/kinsta/env/push.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/env/push.ts)_

## `iroots kinsta env ssh allowlist get`

Get allowed IPs list

```
USAGE
  $ iroots kinsta env ssh allowlist get --apiKey <value> --company <value> --env_id <value>

FLAGS
  --apiKey=<value>   (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --company=<value>  (required) [env: IROOTS_KINSTA_COMPANY_ID]
  --env_id=<value>   (required)

DESCRIPTION
  Get allowed IPs list

EXAMPLES
  $ iroots kinsta env ssh allowlist get
```

_See code: [src/commands/kinsta/env/ssh/allowlist/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/env/ssh/allowlist/get.ts)_

## `iroots kinsta env ssh allowlist set`

Set allowed IPs list

```
USAGE
  $ iroots kinsta env ssh allowlist set --apiKey <value> --company <value> --env_id <value> --ip <value>...

FLAGS
  --apiKey=<value>   (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --company=<value>  (required) [env: IROOTS_KINSTA_COMPANY_ID]
  --env_id=<value>   (required)
  --ip=<value>...    (required) [env: IROOTS_KINSTA_SSH_IP_ALLOWLIST]

DESCRIPTION
  Set allowed IPs list

EXAMPLES
  $ iroots kinsta env ssh allowlist set
```

_See code: [src/commands/kinsta/env/ssh/allowlist/set.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/env/ssh/allowlist/set.ts)_

## `iroots kinsta env webroot`

Change the webroot for an environment.

```
USAGE
  $ iroots kinsta env webroot --apiKey <value> --env <value> --webroot <value> [--clear-all-cache]
    [--refresh-plugins-and-themes]

FLAGS
  --apiKey=<value>              (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --clear-all-cache
  --env=<value>                 (required) [env: IROOTS_KINSTA_ENVIRONMENT_ID]
  --refresh-plugins-and-themes
  --webroot=<value>             (required)

DESCRIPTION
  Change the webroot for an environment.

EXAMPLES
  $ iroots kinsta env webroot
```

_See code: [src/commands/kinsta/env/webroot.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/env/webroot.ts)_

## `iroots kinsta operations get`

Get the status of an operation.

```
USAGE
  $ iroots kinsta operations get --apiKey <value> --operation_id <value>

FLAGS
  --apiKey=<value>        (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --operation_id=<value>  (required)

DESCRIPTION
  Get the status of an operation.

EXAMPLES
  $ iroots kinsta operations get
```

_See code: [src/commands/kinsta/operations/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/operations/get.ts)_

## `iroots kinsta sites get`

Get information about a Kinsta site

```
USAGE
  $ iroots kinsta sites get --apiKey <value> --siteId <value>

FLAGS
  --apiKey=<value>  (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --siteId=<value>  (required)

DESCRIPTION
  Get information about a Kinsta site

EXAMPLES
  $ iroots kinsta sites get
```

_See code: [src/commands/kinsta/sites/get/index.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/sites/get/index.ts)_

## `iroots kinsta sites get environments`

Get information about environments of a Kinsta site

```
USAGE
  $ iroots kinsta sites get environments --apiKey <value> --siteId <value> [--format json|table]

FLAGS
  --apiKey=<value>   (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --format=<option>  [default: table]
                     <options: json|table>
  --siteId=<value>   (required)

DESCRIPTION
  Get information about environments of a Kinsta site

EXAMPLES
  $ iroots kinsta sites get environments
```

_See code: [src/commands/kinsta/sites/get/environments.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/sites/get/environments.ts)_

## `iroots kinsta sites list`

List sites in Kinsta account

```
USAGE
  $ iroots kinsta sites list --apiKey <value> --company <value> [--format json|table] [--include_environments]

FLAGS
  --apiKey=<value>        (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --company=<value>       (required) [env: IROOTS_KINSTA_COMPANY_ID]
  --format=<option>       [default: table]
                          <options: json|table>
  --include_environments

DESCRIPTION
  List sites in Kinsta account

EXAMPLES
  $ iroots kinsta sites list
```

_See code: [src/commands/kinsta/sites/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/sites/list.ts)_

## `iroots kinsta sites new`

Create a new Kinsta site

```
USAGE
  $ iroots kinsta sites new --apiKey <value> --company <value> --display_name <value> --region
    asia-east1|asia-east2|asia-northeast1|asia-northeast2|asia-northeast3|asia-south1|asia-south2|asia-southeast1|asia-s
    outheast2|australia-southeast1|australia-southeast2|europe-central2|europe-north1|europe-southwest1|europe-west1|eur
    ope-west2|europe-west3|europe-west4|europe-west6|europe-west8|europe-west9|me-west1|northamerica-northeast1|northame
    rica-northeast2|southamerica-east1|southamerica-west1|us-central1|us-east1|us-east4|us-east5|us-south1|us-west1|us-w
    est2|us-west3|us-west4

FLAGS
  --apiKey=<value>
      (required) [env: IROOTS_KINSTA_API_KEY] The API key

  --company=<value>
      (required) [env: IROOTS_KINSTA_COMPANY_ID]

  --display_name=<value>
      (required) [env: IROOTS_KINSTA_DISPLAY_NAME]

  --region=<option>
      (required) [default: europe-west2]
      <options: asia-east1|asia-east2|asia-northeast1|asia-northeast2|asia-northeast3|asia-south1|asia-south2|asia-southea
      st1|asia-southeast2|australia-southeast1|australia-southeast2|europe-central2|europe-north1|europe-southwest1|europe
      -west1|europe-west2|europe-west3|europe-west4|europe-west6|europe-west8|europe-west9|me-west1|northamerica-northeast
      1|northamerica-northeast2|southamerica-east1|southamerica-west1|us-central1|us-east1|us-east4|us-east5|us-south1|us-
      west1|us-west2|us-west3|us-west4>

DESCRIPTION
  Create a new Kinsta site

EXAMPLES
  $ iroots kinsta sites new
```

_See code: [src/commands/kinsta/sites/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/sites/new.ts)_

## `iroots kinsta sites tools php-version-set`

Set an environments PHP version.

```
USAGE
  $ iroots kinsta sites tools php-version-set --apiKey <value> --environment_id <value> --php_version
  8.0|8.1|8.2|8.3|8.4

FLAGS
  --apiKey=<value>          (required) [env: IROOTS_KINSTA_API_KEY] The API key
  --environment_id=<value>  (required) [env: IROOTS_KINSTA_ENVIRONMENT_ID]
  --php_version=<option>    (required)
                            <options: 8.0|8.1|8.2|8.3|8.4>

DESCRIPTION
  Set an environments PHP version.

EXAMPLES
  $ iroots kinsta sites tools php-version-set
```

_See code: [src/commands/kinsta/sites/tools/php-version-set.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/sites/tools/php-version-set.ts)_

## `iroots new`

Create a new project

```
USAGE
  $ iroots new -b <value> --bedrock_repo_pat <value> --bedrock_template_branch <value>
    --bedrock_template_remote <value> --display_name <value> (--kinsta_api_key <value> --kinsta) (--kinsta_company
    <value> ) (--php_version 8.0|8.1|8.2|8.3|8.4 ) (--webroot <value> ) --kinsta_ssh_ip_allowlist <value>
    (--packagist_api_key <value> --packagist) (--packagist_api_secret <value> ) (--sendgrid_api_key <value> --sendgrid)
    (--sentry_api_key <value> --sentry) (--sentry_organisation_slug <value> ) (--sentry_project_platform <value> )
    (--sentry_team_slug <value> ) -s <value> --theme_template_branch <value> --theme_template_remote <value> -t <value>
    --trellis_template_branch <value> --trellis_template_remote <value> --trellis_template_vault_pass <value>
    [--bedrock_remote_branch <value>] [-d] [--git_push] [--github] [--github_team <value>] [--github_team_permission
    <value>] [-h] [--kinsta_free_environments <value>...] [--kinsta_premium_environments <value>...] [-l]
    [--network_media_library_site_id <value>  [--network_media_library --multisite]] [--sentry_project_default_rules ]
    [--sentry_project_slug <value> ] [--theme_clone] [--trellis_remote_branch <value>] [--turnstile  ]
    [--cloudflare_zero_trust_access  (--cloudflare_zone_id_live <value> (--kinsta_setup_domains  --cloudflare_account
    <value> --cloudflare_api_key <value>)) (--cloudflare_zone_id_dev <value> )] [--wp_ssh_aliases]

FLAGS
  -b, --bedrock_remote=<value>                  (required) [env: IROOTS_NEW_BEDROCK_REMOTE] bedrock importremote
  -d, --[no-]deploy                             whether to deploy or not
  -h, --help                                    Show CLI help.
  -l, --[no-]local                              whether to setup local site or not
  -s, --site=<value>                            (required) [env: IROOTS_NEW_SITE] site key
  -t, --trellis_remote=<value>                  (required) [env: IROOTS_NEW_TRELLIS_REMOTE] trellis remote
      --bedrock_remote_branch=<value>           [default: main, env: IROOTS_NEW_BEDROCK_REMOTE_BRANCH] the branch to use
                                                for your new bedrock remote
      --bedrock_repo_pat=<value>                (required) [env: IROOTS_NEW_BEDROCK_REPO_PAT] the bedrock personal
                                                access token for GitHub Actions to clone trellis
      --bedrock_template_branch=<value>         (required) [default: master, env: IROOTS_NEW_BEDROCK_TEMPLATE_BRANCH]
                                                bedrock template branch
      --bedrock_template_remote=<value>         (required) [default: git@github.com:ItinerisLtd/bedrock.git, env:
                                                IROOTS_NEW_BEDROCK_TEMPLATE_REMOTE] bedrock template remote
      --cloudflare_account=<value>              (required) [env: IROOTS_CLOUDFLARE_ACCOUNT_ID] The account identifier
      --cloudflare_api_key=<value>              (required) [env: IROOTS_CLOUDFLARE_API_KEY] The API key
      --[no-]cloudflare_zero_trust_access       [env: IROOTS_CLOUDFLARE_ZERO_TRUST_ACCESS] Whether to create a
                                                Cloudflare Zero Trust Access application
      --cloudflare_zone_id_dev=<value>          (required) [env: IROOTS_CLOUDFLARE_ZONE_ID_DEV] The Zone ID for dev DNS
                                                record creation
      --cloudflare_zone_id_live=<value>         (required) [env: IROOTS_CLOUDFLARE_ZONE_ID_LIVE] The Zone ID for live
                                                DNS record creation
      --display_name=<value>                    (required) [env: IROOTS_NEW_DISPLAY_NAME] the display name for the site
      --[no-]git_push                           whether to push to git remotes or not
      --[no-]github                             whether to use GH CLI/API or not
      --github_team=<value>                     [default: php-team] the team to add to the created GitHub repositories
      --github_team_permission=<value>          [default: maintain] the permission to set for the specified GitHub team
      --[no-]kinsta                             whether or not to create A Kinsta site
      --kinsta_api_key=<value>                  (required) [env: IROOTS_KINSTA_API_KEY] the API key for using the Kinsta
                                                API
      --kinsta_company=<value>                  (required) [env: IROOTS_KINSTA_COMPANY_ID] the company ID of your Kinsta
                                                account
      --kinsta_free_environments=<value>...     [default: Staging, env: IROOTS_NEW_KINSTA_FREE_ENVIRONMENTS] the
                                                additional free environment names you wish to create
      --kinsta_premium_environments=<value>...  [default: UAT, env: IROOTS_NEW_KINSTA_PREMIUM_ENVIRONMENTS] the
                                                additional premium environment names you wish to create
      --kinsta_setup_domains                    whether to setup Kinsta domains and Cloudflare DNS records or not
      --kinsta_ssh_ip_allowlist=<value>         (required) [env: IROOTS_KINSTA_SSH_IP_ALLOWLIST] A list of IPs to allow
                                                for Kinsta SSH access
      --multisite                               [env: IROOTS_NEW_IS_MULTISITE] whether or not to setup a WordPress
                                                multisite network
      --network_media_library                   [env: IROOTS_NEW_NETWORK_MEDIA_LIBRARY] whether or not to setup Network
                                                Media Library instead of WP Media Folder
      --network_media_library_site_id=<value>   [default: 1, env: IROOTS_NEW_NETWORK_MEDIA_LIBRARY_SITE_ID] the site ID
                                                you wish to use for the network media library
      --[no-]packagist                          whether or not to create a Private Packagist token for the new project
      --packagist_api_key=<value>               (required) [env: IROOTS_PACKAGIST_API_KEY] The API key
      --packagist_api_secret=<value>            (required) [env: IROOTS_PACKAGIST_API_SECRET] The API SECRET
      --php_version=<option>                    (required) [default: 8.4, env: IROOTS_PHP_VERSION] the PHP version to
                                                set on site environments
                                                <options: 8.0|8.1|8.2|8.3|8.4>
      --[no-]sendgrid                           whether or not to create a SendGrid API key for the new project
      --sendgrid_api_key=<value>                (required) [env: IROOTS_SENDGRID_API_KEY] the SendGrid API key used to
                                                send requests to their API
      --[no-]sentry                             whether or not to create a Sentry project
      --sentry_api_key=<value>                  (required) [env: IROOTS_SENTRY_API_KEY] The API key
      --sentry_organisation_slug=<value>        (required) [env: IROOTS_SENTRY_ORGANISATION_SLUG] The slug of the
                                                organization the resource belongs to.
      --sentry_project_default_rules            Defaults to true where the behavior is to alert the user on every new
                                                issue. Setting this to false will turn this off and the user must create
                                                their own alerts to be notified of new issues.
      --sentry_project_platform=<value>         (required) [default: php] The platform for the project.
      --sentry_project_slug=<value>             Uniquely identifies a project. If omitted, we will use the project
                                                display name.
      --sentry_team_slug=<value>                (required) [env: IROOTS_SENTRY_TEAM_SLUG] The slug of the organization
                                                the resource belongs to.
      --[no-]theme_clone                        [env: IROOTS_NEW_THEME_CLONE] whether or not to clone the theme
      --theme_template_branch=<value>           (required) [default: main, env: IROOTS_NEW_THEME_TEMPLATE_BRANCH] theme
                                                template branch
      --theme_template_remote=<value>           (required) [default: git@github.com:ItinerisLtd/sage.git, env:
                                                IROOTS_NEW_THEME_TEMPLATE_REMOTE] theme template remote
      --trellis_remote_branch=<value>           [default: main, env: IROOTS_NEW_TRELLIS_REMOTE_BRANCH] the branch to use
                                                for your new trellis remote
      --trellis_template_branch=<value>         (required) [default: master, env: IROOTS_NEW_TRELLIS_TEMPLATE_BRANCH]
                                                trellis template branch
      --trellis_template_remote=<value>         (required) [default: git@github.com:ItinerisLtd/trellis-kinsta.git, env:
                                                IROOTS_NEW_TRELLIS_TEMPLATE_REMOTE] trellis template remote
      --trellis_template_vault_pass=<value>     (required) [env: IROOTS_NEW_TRELLIS_TEMPLATE_VAULT_PASS] trellis
                                                template vault password
      --[no-]turnstile                          whether or not to create a Clouflare Turnstile instance
      --webroot=<value>                         (required) [default: /current/web]
      --[no-]wp_ssh_aliases                     [env: IROOTS_NEW_WP_CLI_SSH_ALIASES] whether to generate SSH aliases for
                                                WP CLI or not

DESCRIPTION
  Create a new project
```

_See code: [src/commands/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/new.ts)_

## `iroots packagist tokens delete`

Delete a Packagist token.

```
USAGE
  $ iroots packagist tokens delete --apiKey <value> --apiSecret <value> --tokenId <value>

FLAGS
  --apiKey=<value>     (required) [env: IROOTS_PACKAGIST_API_KEY] The API key
  --apiSecret=<value>  (required) [env: IROOTS_PACKAGIST_API_SECRET] The API SECRET
  --tokenId=<value>    (required) The ID of the token we want to delete

DESCRIPTION
  Delete a Packagist token.

EXAMPLES
  $ iroots packagist tokens delete
```

_See code: [src/commands/packagist/tokens/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/packagist/tokens/delete.ts)_

## `iroots packagist tokens list`

List all the tokens

```
USAGE
  $ iroots packagist tokens list --apiKey <value> --apiSecret <value>

FLAGS
  --apiKey=<value>     (required) [env: IROOTS_PACKAGIST_API_KEY] The API key
  --apiSecret=<value>  (required) [env: IROOTS_PACKAGIST_API_SECRET] The API SECRET

DESCRIPTION
  List all the tokens

EXAMPLES
  $ iroots packagist tokens list
```

_See code: [src/commands/packagist/tokens/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/packagist/tokens/list.ts)_

## `iroots packagist tokens new`

Create new token

```
USAGE
  $ iroots packagist tokens new --apiKey <value> --apiSecret <value> --access read|update --description <value>
    [--accessToAllPackages] [--expiresAt <value>] [--teamId <value>]

FLAGS
  --access=<option>      (required) [default: read] Type of access the token will have.
                         <options: read|update>
  --accessToAllPackages  Whether or not the token has access to all packages
  --apiKey=<value>       (required) [env: IROOTS_PACKAGIST_API_KEY] The API key
  --apiSecret=<value>    (required) [env: IROOTS_PACKAGIST_API_SECRET] The API SECRET
  --description=<value>  (required) The description to explain where the token is used.
  --expiresAt=<value>    Time at which the token expires. Example: 2023-11-20T11:36:00+00:00
  --teamId=<value>       The team id to define which packages the token has access to

DESCRIPTION
  Create new token

EXAMPLES
  $ iroots packagist tokens new
```

_See code: [src/commands/packagist/tokens/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/packagist/tokens/new.ts)_

## `iroots packagist tokens regenerate`

Regenerate a token

```
USAGE
  $ iroots packagist tokens regenerate --apiKey <value> --apiSecret <value> --tokenId <value> [--expiresAt <value>]
    [--IConfirmOldTokenWillStopWorkingImmediately]

FLAGS
  --IConfirmOldTokenWillStopWorkingImmediately  The required confirmation field
  --apiKey=<value>                              (required) [env: IROOTS_PACKAGIST_API_KEY] The API key
  --apiSecret=<value>                           (required) [env: IROOTS_PACKAGIST_API_SECRET] The API SECRET
  --expiresAt=<value>                           Time at which the token expires. Example: 2023-11-20T11:36:00+00:00
  --tokenId=<value>                             (required) The ID of token we want to regenerate.

DESCRIPTION
  Regenerate a token

EXAMPLES
  $ iroots packagist tokens regenerate
```

_See code: [src/commands/packagist/tokens/regenerate.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/packagist/tokens/regenerate.ts)_

## `iroots plugins`

List installed plugins.

```
USAGE
  $ iroots plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ iroots plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.74/src/commands/plugins/index.ts)_

## `iroots plugins add PLUGIN`

Installs a plugin into iroots.

```
USAGE
  $ iroots plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into iroots.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the IROOTS_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the IROOTS_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ iroots plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ iroots plugins add myplugin

  Install a plugin from a github url.

    $ iroots plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ iroots plugins add someuser/someplugin
```

## `iroots plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ iroots plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ iroots plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.74/src/commands/plugins/inspect.ts)_

## `iroots plugins install PLUGIN`

Installs a plugin into iroots.

```
USAGE
  $ iroots plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into iroots.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the IROOTS_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the IROOTS_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ iroots plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ iroots plugins install myplugin

  Install a plugin from a github url.

    $ iroots plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ iroots plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.74/src/commands/plugins/install.ts)_

## `iroots plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ iroots plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ iroots plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.74/src/commands/plugins/link.ts)_

## `iroots plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ iroots plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ iroots plugins unlink
  $ iroots plugins remove

EXAMPLES
  $ iroots plugins remove myplugin
```

## `iroots plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ iroots plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.74/src/commands/plugins/reset.ts)_

## `iroots plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ iroots plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ iroots plugins unlink
  $ iroots plugins remove

EXAMPLES
  $ iroots plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.74/src/commands/plugins/uninstall.ts)_

## `iroots plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ iroots plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ iroots plugins unlink
  $ iroots plugins remove

EXAMPLES
  $ iroots plugins unlink myplugin
```

## `iroots plugins update`

Update installed plugins.

```
USAGE
  $ iroots plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.74/src/commands/plugins/update.ts)_

## `iroots sendgrid access delete`

Remove one or more IPs from the allow list

```
USAGE
  $ iroots sendgrid access delete --apiKey <value> --rule_id <value>...

FLAGS
  --apiKey=<value>      (required) [env: IROOTS_SENDGRID_API_KEY] The API key
  --rule_id=<value>...  (required) the IP rule Id

DESCRIPTION
  Remove one or more IPs from the allow list

EXAMPLES
  $ iroots sendgrid access delete
```

_See code: [src/commands/sendgrid/access/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/access/delete.ts)_

## `iroots sendgrid access get`

Retrieve a specific allowed IP

```
USAGE
  $ iroots sendgrid access get --apiKey <value> --rule_id <value>

FLAGS
  --apiKey=<value>   (required) [env: IROOTS_SENDGRID_API_KEY] The API key
  --rule_id=<value>  (required) the IP rule Id

DESCRIPTION
  Retrieve a specific allowed IP

EXAMPLES
  $ iroots sendgrid access get
```

_See code: [src/commands/sendgrid/access/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/access/get.ts)_

## `iroots sendgrid access list`

List allowed IPs in SendGrid account

```
USAGE
  $ iroots sendgrid access list --apiKey <value>

FLAGS
  --apiKey=<value>  (required) [env: IROOTS_SENDGRID_API_KEY] The API key

DESCRIPTION
  List allowed IPs in SendGrid account

EXAMPLES
  $ iroots sendgrid access list
```

_See code: [src/commands/sendgrid/access/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/access/list.ts)_

## `iroots sendgrid access new`

Add one or more IPs to the allow list

```
USAGE
  $ iroots sendgrid access new --apiKey <value> --ip <value>...

FLAGS
  --apiKey=<value>  (required) [env: IROOTS_SENDGRID_API_KEY] The API key
  --ip=<value>...   (required) the IP address to whitelist

DESCRIPTION
  Add one or more IPs to the allow list

EXAMPLES
  $ iroots sendgrid access new
```

_See code: [src/commands/sendgrid/access/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/access/new.ts)_

## `iroots sendgrid api-keys delete`

Delete an API key

```
USAGE
  $ iroots sendgrid api-keys delete --apiKey <value> --apiKeyId <value>

FLAGS
  --apiKey=<value>    (required) [env: IROOTS_SENDGRID_API_KEY] The API key
  --apiKeyId=<value>  (required) The API key ID

DESCRIPTION
  Delete an API key

EXAMPLES
  $ iroots sendgrid api-keys delete
```

_See code: [src/commands/sendgrid/api-keys/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/api-keys/delete.ts)_

## `iroots sendgrid api-keys get`

Get information about an API key

```
USAGE
  $ iroots sendgrid api-keys get --apiKey <value> --apiKeyId <value>

FLAGS
  --apiKey=<value>    (required) [env: IROOTS_SENDGRID_API_KEY] The API key
  --apiKeyId=<value>  (required) The API key ID

DESCRIPTION
  Get information about an API key

EXAMPLES
  $ iroots sendgrid api-keys get
```

_See code: [src/commands/sendgrid/api-keys/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/api-keys/get.ts)_

## `iroots sendgrid api-keys list`

List API keys in SendGrid account

```
USAGE
  $ iroots sendgrid api-keys list --apiKey <value> [--limit <value>]

FLAGS
  --apiKey=<value>  (required) [env: IROOTS_SENDGRID_API_KEY] The API key
  --limit=<value>   Specifies the number of results to be returned by the API.

DESCRIPTION
  List API keys in SendGrid account

EXAMPLES
  $ iroots sendgrid api-keys list
```

_See code: [src/commands/sendgrid/api-keys/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/api-keys/list.ts)_

## `iroots sendgrid api-keys new`

Create an API key

```
USAGE
  $ iroots sendgrid api-keys new --apiKey <value> --name <value> --scopes <value>...

FLAGS
  --apiKey=<value>     (required) [env: IROOTS_SENDGRID_API_KEY] The API key
  --name=<value>       (required) The name you will use to describe this API Key.
  --scopes=<value>...  (required) [default: mail.send] The individual permissions that you are giving to this API Key.
                       See https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/authorization#table-of
                       -contents for available scopes.

DESCRIPTION
  Create an API key

EXAMPLES
  $ iroots sendgrid api-keys new
```

_See code: [src/commands/sendgrid/api-keys/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/api-keys/new.ts)_

## `iroots sentry projects delete`

Delete a specific project from Sentry account

```
USAGE
  $ iroots sentry projects delete --apiKey <value> --organisation <value> --project <value>

FLAGS
  --apiKey=<value>        (required) [env: IROOTS_SENTRY_API_KEY] The API key
  --organisation=<value>  (required) [env: IROOTS_SENTRY_ORGANISATION_SLUG]
  --project=<value>       (required)

DESCRIPTION
  Delete a specific project from Sentry account

EXAMPLES
  $ iroots sentry projects delete
```

_See code: [src/commands/sentry/projects/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sentry/projects/delete.ts)_

## `iroots sentry projects get`

Get a specific project from Sentry account

```
USAGE
  $ iroots sentry projects get --apiKey <value> --organisationSlug <value> --projectSlug <value>

FLAGS
  --apiKey=<value>            (required) [env: IROOTS_SENTRY_API_KEY] The API key
  --organisationSlug=<value>  (required) [env: IROOTS_SENTRY_ORGANISATION_SLUG]
  --projectSlug=<value>       (required)

DESCRIPTION
  Get a specific project from Sentry account

EXAMPLES
  $ iroots sentry projects get
```

_See code: [src/commands/sentry/projects/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sentry/projects/get.ts)_

## `iroots sentry projects keys list`

List client keys bound to a project

```
USAGE
  $ iroots sentry projects keys list --apiKey <value> --organisationSlug <value> --projectSlug <value>

FLAGS
  --apiKey=<value>            (required) [env: IROOTS_SENTRY_API_KEY] The API key
  --organisationSlug=<value>  (required) [env: IROOTS_SENTRY_ORGANISATION_SLUG]
  --projectSlug=<value>       (required)

DESCRIPTION
  List client keys bound to a project

EXAMPLES
  $ iroots sentry projects keys list
```

_See code: [src/commands/sentry/projects/keys/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sentry/projects/keys/list.ts)_

## `iroots sentry projects list`

List projects in Sentry account

```
USAGE
  $ iroots sentry projects list --apiKey <value>

FLAGS
  --apiKey=<value>  (required) [env: IROOTS_SENTRY_API_KEY] The API key

DESCRIPTION
  List projects in Sentry account

EXAMPLES
  $ iroots sentry projects list
```

_See code: [src/commands/sentry/projects/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sentry/projects/list.ts)_

## `iroots sentry projects new`

Create a new project in Sentry

```
USAGE
  $ iroots sentry projects new --apiKey <value> --name <value> --organisationSlug <value> --platform <value> --teamSlug
    <value> [--defaultRules] [--slug <value>]

FLAGS
  --apiKey=<value>            (required) [env: IROOTS_SENTRY_API_KEY] The API key
  --defaultRules              Defaults to true where the behavior is to alert the user on every new issue. Setting this
                              to false will turn this off and the user must create their own alerts to be notified of
                              new issues.
  --name=<value>              (required) The name for the project.
  --organisationSlug=<value>  (required) [env: IROOTS_SENTRY_ORGANISATION_SLUG] The slug of the organization the
                              resource belongs to.
  --platform=<value>          (required) [default: php] The platform for the project.
  --slug=<value>              Uniquely identifies a project.
  --teamSlug=<value>          (required) [env: IROOTS_SENTRY_TEAM_SLUG] The slug of the organization the resource
                              belongs to.

DESCRIPTION
  Create a new project in Sentry

EXAMPLES
  $ iroots sentry projects new
```

_See code: [src/commands/sentry/projects/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sentry/projects/new.ts)_

## `iroots stackpath sites get`

Get an individual site

```
USAGE
  $ iroots stackpath sites get --clientId <value> --clientSecret <value> --stackId <value> --siteId <value>

FLAGS
  --clientId=<value>      (required) [env: IROOTS_STACKPATH_CLIENT_ID] The API client ID
  --clientSecret=<value>  (required) [env: IROOTS_STACKPATH_CLIENT_SECRET] The API client Secret
  --siteId=<value>        (required) [env: IROOTS_STACKPATH_SITE_ID] The site ID
  --stackId=<value>       (required) [env: IROOTS_STACKPATH_STACK_ID] The Stack ID

DESCRIPTION
  Get an individual site

EXAMPLES
  $ iroots stackpath sites get
```

_See code: [src/commands/stackpath/sites/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/stackpath/sites/get.ts)_

## `iroots stackpath sites list`

Get list of all sites

```
USAGE
  $ iroots stackpath sites list --clientId <value> --clientSecret <value> --stackId <value>

FLAGS
  --clientId=<value>      (required) [env: IROOTS_STACKPATH_CLIENT_ID] The API client ID
  --clientSecret=<value>  (required) [env: IROOTS_STACKPATH_CLIENT_SECRET] The API client Secret
  --stackId=<value>       (required) [env: IROOTS_STACKPATH_STACK_ID] The Stack ID

DESCRIPTION
  Get list of all sites

EXAMPLES
  $ iroots stackpath sites list
```

_See code: [src/commands/stackpath/sites/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/stackpath/sites/list.ts)_

## `iroots statuscake uptime delete`

Delete an uptime check

```
USAGE
  $ iroots statuscake uptime delete --apiKey <value> --test_id <value>

FLAGS
  --apiKey=<value>   (required) [env: IROOTS_STATUSCAKE_API_KEY] The API key
  --test_id=<value>  (required) The ID of the uptime check to delete

DESCRIPTION
  Delete an uptime check

EXAMPLES
  $ iroots statuscake uptime delete
```

_See code: [src/commands/statuscake/uptime/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/statuscake/uptime/delete.ts)_

## `iroots statuscake uptime get`

Get information about an uptime monitor

```
USAGE
  $ iroots statuscake uptime get --apiKey <value> --test_id <value>

FLAGS
  --apiKey=<value>   (required) [env: IROOTS_STATUSCAKE_API_KEY] The API key
  --test_id=<value>  (required) Uptime check ID

DESCRIPTION
  Get information about an uptime monitor

EXAMPLES
  $ iroots statuscake uptime get
```

_See code: [src/commands/statuscake/uptime/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/statuscake/uptime/get.ts)_

## `iroots statuscake uptime list`

List uptime monitors

```
USAGE
  $ iroots statuscake uptime list --apiKey <value> [--limit <value>] [--matchany] [--nouptime] [--page <value>] [--status
    up|down] [--tags <value>...]

FLAGS
  --apiKey=<value>   (required) [env: IROOTS_STATUSCAKE_API_KEY] The API key
  --limit=<value>    [default: 25] Page of results
  --matchany         Include uptime checks in response that match any specified tag or all tags
  --nouptime         Do not calculate uptime percentages for results
  --page=<value>     [default: 1] Page of results
  --status=<option>  [default: up] Uptime check status
                     <options: up|down>
  --tags=<value>...  [default: ] Comma separated list of tags assocaited with a check

DESCRIPTION
  List uptime monitors

EXAMPLES
  $ iroots statuscake uptime list
```

_See code: [src/commands/statuscake/uptime/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/statuscake/uptime/list.ts)_

## `iroots statuscake uptime new`

Create a new uptime monitor

```
USAGE
  $ iroots statuscake uptime new --apiKey <value> --website_url <value> [--basic_password <value>] [--basic_username
    <value>] [--check_rate 0|30|60|300|900|1800|3600|86400] [--confirmation <value>] [--contact_groups <value>]
    [--custom_header <value>] [--dns_ips <value>] [--dns_server <value>] [--do_not_find <value>] [--enable_ssl_alert
    <value>] [--final_endpoint <value>] [--find_string <value>] [--follow_redirects <value>] [--host <value>]
    [--include_header <value>] [--name <value>] [--paused <value>] [--port <value>] [--post_body <value>] [--post_raw
    <value>] [--regions <value>...] [--status_codes_csv <value>] [--tags <value>] [--test_type
    DNS|HEAD|HTTP|PING|SMTP|SSH|TCP] [--timeout <value>] [--trigger_rate <value>] [--use_jar <value>] [--user_agent
    <value>]

FLAGS
  --apiKey=<value>            (required) [env: IROOTS_STATUSCAKE_API_KEY] The API key
  --basic_password=<value>
  --basic_username=<value>
  --check_rate=<option>       [default: 60] Number of seconds between checks
                              <options: 0|30|60|300|900|1800|3600|86400>
  --confirmation=<value>
  --contact_groups=<value>    [env: IROOTS_STATUSCAKE_UPTIME_NEW_CONTACT_GROUP_IDS] List of contact group IDs
  --custom_header=<value>
  --dns_ips=<value>
  --dns_server=<value>
  --do_not_find=<value>
  --enable_ssl_alert=<value>
  --final_endpoint=<value>
  --find_string=<value>
  --follow_redirects=<value>
  --host=<value>
  --include_header=<value>
  --name=<value>              Name of the check. If omitted, we will extract the domain from --website_url and use
                              this.
  --paused=<value>
  --port=<value>
  --post_body=<value>
  --post_raw=<value>
  --regions=<value>...        [default: london]
  --status_codes_csv=<value>
  --tags=<value>
  --test_type=<option>        [default: HEAD] Uptime check type
                              <options: DNS|HEAD|HTTP|PING|SMTP|SSH|TCP>
  --timeout=<value>
  --trigger_rate=<value>
  --use_jar=<value>
  --user_agent=<value>
  --website_url=<value>       (required) URL or IP address of the server under test

DESCRIPTION
  Create a new uptime monitor

EXAMPLES
  $ iroots statuscake uptime new
```

_See code: [src/commands/statuscake/uptime/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/statuscake/uptime/new.ts)_
<!-- commandsstop -->

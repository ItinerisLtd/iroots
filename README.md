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
* [`iroots cloudflare:turnstile:delete`](#iroots-cloudflareturnstiledelete)
* [`iroots cloudflare:turnstile:get`](#iroots-cloudflareturnstileget)
* [`iroots cloudflare:turnstile:list`](#iroots-cloudflareturnstilelist)
* [`iroots cloudflare:turnstile:new`](#iroots-cloudflareturnstilenew)
* [`iroots help [COMMANDS]`](#iroots-help-commands)
* [`iroots kinsta:operations:get`](#iroots-kinstaoperationsget)
* [`iroots kinsta:sites:get`](#iroots-kinstasitesget)
* [`iroots kinsta:sites:get:environments`](#iroots-kinstasitesgetenvironments)
* [`iroots kinsta:sites:list`](#iroots-kinstasiteslist)
* [`iroots kinsta:sites:new`](#iroots-kinstasitesnew)
* [`iroots kinsta:sites:tools:php-version-set`](#iroots-kinstasitestoolsphp-version-set)
* [`iroots new`](#iroots-new)
* [`iroots packagist:tokens:delete`](#iroots-packagisttokensdelete)
* [`iroots packagist:tokens:list`](#iroots-packagisttokenslist)
* [`iroots packagist:tokens:new`](#iroots-packagisttokensnew)
* [`iroots packagist:tokens:regenerate`](#iroots-packagisttokensregenerate)
* [`iroots sendgrid:access:delete`](#iroots-sendgridaccessdelete)
* [`iroots sendgrid:access:get`](#iroots-sendgridaccessget)
* [`iroots sendgrid:access:list`](#iroots-sendgridaccesslist)
* [`iroots sendgrid:access:new`](#iroots-sendgridaccessnew)
* [`iroots sendgrid:api-keys:delete`](#iroots-sendgridapi-keysdelete)
* [`iroots sendgrid:api-keys:get`](#iroots-sendgridapi-keysget)
* [`iroots sendgrid:api-keys:list`](#iroots-sendgridapi-keyslist)
* [`iroots sendgrid:api-keys:new`](#iroots-sendgridapi-keysnew)
* [`iroots sentry:projects:delete`](#iroots-sentryprojectsdelete)
* [`iroots sentry:projects:get`](#iroots-sentryprojectsget)
* [`iroots sentry:projects:list`](#iroots-sentryprojectslist)
* [`iroots sentry:projects:new`](#iroots-sentryprojectsnew)
* [`iroots stackpath:sites:get`](#iroots-stackpathsitesget)
* [`iroots stackpath:sites:list`](#iroots-stackpathsiteslist)
* [`iroots statuscake:uptime:get`](#iroots-statuscakeuptimeget)
* [`iroots statuscake:uptime:list`](#iroots-statuscakeuptimelist)
* [`iroots statuscake:uptime:new`](#iroots-statuscakeuptimenew)

## `iroots cloudflare:turnstile:delete`

Delete a Turnstile instance

```
USAGE
  $ iroots cloudflare:turnstile:delete --apiKey <value> --account <value> --siteKey <value>

FLAGS
  --account=<value>  (required) The account identifier
  --apiKey=<value>   (required) The API key
  --siteKey=<value>  (required) The site key

DESCRIPTION
  Delete a Turnstile instance

EXAMPLES
  $ iroots cloudflare:turnstile:delete
```

_See code: [src/commands/cloudflare/turnstile/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/turnstile/delete.ts)_

## `iroots cloudflare:turnstile:get`

Get a Turnstile instance

```
USAGE
  $ iroots cloudflare:turnstile:get --apiKey <value> --account <value> --siteKey <value>

FLAGS
  --account=<value>  (required) The account identifier
  --apiKey=<value>   (required) The API key
  --siteKey=<value>  (required) The site key

DESCRIPTION
  Get a Turnstile instance

EXAMPLES
  $ iroots cloudflare:turnstile:get
```

_See code: [src/commands/cloudflare/turnstile/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/turnstile/get.ts)_

## `iroots cloudflare:turnstile:list`

List Turnstile instances

```
USAGE
  $ iroots cloudflare:turnstile:list --apiKey <value> --account <value>

FLAGS
  --account=<value>  (required) The account identifier
  --apiKey=<value>   (required) The API key

DESCRIPTION
  List Turnstile instances

EXAMPLES
  $ iroots cloudflare:turnstile:list
```

_See code: [src/commands/cloudflare/turnstile/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/turnstile/list.ts)_

## `iroots cloudflare:turnstile:new`

Create a new Turnstile instance

```
USAGE
  $ iroots cloudflare:turnstile:new --apiKey <value> --account <value> --domains <value> --mode
    non-interactive|invisible|managed [--bot_fight_mode] [--clearance_level <value>] [--name <value>] [--offlabel]
    [--region <value>]

FLAGS
  --account=<value>          (required) The account identifier
  --apiKey=<value>           (required) The API key
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

DESCRIPTION
  Create a new Turnstile instance

EXAMPLES
  $ iroots cloudflare:turnstile:new

FLAG DESCRIPTIONS
  --name=<value>  >= 1 characters <= 254 characters

    Human readable widget name. Not unique. Cloudflare suggests that you set this to a meaningful string to make it
    easier to identify your widget, and where it is used. >= 1 characters <= 254 characters
```

_See code: [src/commands/cloudflare/turnstile/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/cloudflare/turnstile/new.ts)_

## `iroots help [COMMANDS]`

Display help for iroots.

```
USAGE
  $ iroots help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for iroots.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.11/src/commands/help.ts)_

## `iroots kinsta:operations:get`

Get the status of an operation.

```
USAGE
  $ iroots kinsta:operations:get --apiKey <value> --operation_id <value>

FLAGS
  --apiKey=<value>        (required) The API key
  --operation_id=<value>  (required)

DESCRIPTION
  Get the status of an operation.

EXAMPLES
  $ iroots kinsta:operations:get
```

_See code: [src/commands/kinsta/operations/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/operations/get.ts)_

## `iroots kinsta:sites:get`

Get information about a Kinsta site

```
USAGE
  $ iroots kinsta:sites:get --apiKey <value> --siteId <value>

FLAGS
  --apiKey=<value>  (required) The API key
  --siteId=<value>  (required)

DESCRIPTION
  Get information about a Kinsta site

EXAMPLES
  $ iroots kinsta:sites:get
```

_See code: [src/commands/kinsta/sites/get/index.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/sites/get/index.ts)_

## `iroots kinsta:sites:get:environments`

Get information about environments of a Kinsta site

```
USAGE
  $ iroots kinsta:sites:get:environments --apiKey <value> --siteId <value>

FLAGS
  --apiKey=<value>  (required) The API key
  --siteId=<value>  (required)

DESCRIPTION
  Get information about environments of a Kinsta site

EXAMPLES
  $ iroots kinsta:sites:get:environments
```

_See code: [src/commands/kinsta/sites/get/environments.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/sites/get/environments.ts)_

## `iroots kinsta:sites:list`

List sites in Kinsta account

```
USAGE
  $ iroots kinsta:sites:list --apiKey <value> --company <value>

FLAGS
  --apiKey=<value>   (required) The API key
  --company=<value>  (required)

DESCRIPTION
  List sites in Kinsta account

EXAMPLES
  $ iroots kinsta:sites:list
```

_See code: [src/commands/kinsta/sites/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/sites/list.ts)_

## `iroots kinsta:sites:new`

Create a new Kinsta site

```
USAGE
  $ iroots kinsta:sites:new --apiKey <value> --company <value> --display_name <value> --region
    asia-east1|asia-east2|asia-northeast1|asia-northeast2|asia-northeast3|asia-south1|asia-south2|asia-southeast1|asia-s
    outheast2|australia-southeast1|australia-southeast2|europe-central2|europe-north1|europe-southwest1|europe-west1|eur
    ope-west2|europe-west3|europe-west4|europe-west6|europe-west8|europe-west9|me-west1|northamerica-northeast1|northame
    rica-northeast2|southamerica-east1|southamerica-west1|us-central1|us-east1|us-east4|us-east5|us-south1|us-west1|us-w
    est2|us-west3|us-west4

FLAGS
  --apiKey=<value>
      (required) The API key

  --company=<value>
      (required)

  --display_name=<value>
      (required)

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
  $ iroots kinsta:sites:new
```

_See code: [src/commands/kinsta/sites/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/sites/new.ts)_

## `iroots kinsta:sites:tools:php-version-set`

Set an environments PHP version.

```
USAGE
  $ iroots kinsta:sites:tools:php-version-set --apiKey <value> --environment_id <value> --php_version 8.0|8.1|8.2

FLAGS
  --apiKey=<value>          (required) The API key
  --environment_id=<value>  (required)
  --php_version=<option>    (required)
                            <options: 8.0|8.1|8.2>

DESCRIPTION
  Set an environments PHP version.

EXAMPLES
  $ iroots kinsta:sites:tools:php-version-set
```

_See code: [src/commands/kinsta/sites/tools/php-version-set.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/kinsta/sites/tools/php-version-set.ts)_

## `iroots new`

Create a new project

```
USAGE
  $ iroots new -s <value> -b <value> --bedrock_repo_pat <value> -t <value> --bedrock_template_remote
    <value> --bedrock_template_branch <value> --trellis_template_remote <value> --trellis_template_branch <value>
    --theme_template_remote <value> --theme_template_branch <value> --trellis_template_vault_pass <value>
    (--packagist_api_key <value> --packagist) (--packagist_api_secret <value> ) (--sendgrid_api_key <value> --sendgrid)
    (--kinsta_api_key <value> --kinsta) (--kinsta_company <value> ) (--kinsta_php_version 8.0|8.1|8.2 ) (--display_name
    <value> ) [-h] [-d] [-l] [--git_push] [--github] [--github_team <value>] [--github_team_permission <value>]
    [--bedrock_remote_branch <value>] [--trellis_remote_branch <value>] [--network_media_library_site_id <value>
    --multisite]

FLAGS
  -b, --bedrock_remote=<value>                 (required) bedrock importremote
  -d, --[no-]deploy                            whether to deploy or not
  -h, --help                                   Show CLI help.
  -l, --[no-]local                             whether to setup local site or not
  -s, --site=<value>                           (required) site key
  -t, --trellis_remote=<value>                 (required) trellis remote
      --bedrock_remote_branch=<value>          [default: main] the branch to use for your new bedrock remote
      --bedrock_repo_pat=<value>               (required) the bedrock personal access token for GitHub Actions to clone
                                               trellis
      --bedrock_template_branch=<value>        (required) [default: master] bedrock template branch
      --bedrock_template_remote=<value>        (required) [default: git@github.com:ItinerisLtd/bedrock.git] bedrock
                                               template remote
      --display_name=<value>                   (required) the display name for the site
      --[no-]git_push                          whether to push to git remotes or not
      --[no-]github                            whether to use GH CLI/API or not
      --github_team=<value>                    [default: php-team] the team to add to the created GitHub repositories
      --github_team_permission=<value>         [default: maintain] the permission to set for the specified GitHub team
      --[no-]kinsta                            whether or not to create A Kinsta site
      --kinsta_api_key=<value>                 (required) the API key for using the Kinsta API
      --kinsta_company=<value>                 (required) the company ID of your Kinsta account
      --kinsta_php_version=<option>            (required) [default: 8.1] the PHP version to set on site environments
                                               <options: 8.0|8.1|8.2>
      --multisite                              whether or not to setup a WordPress multisite network
      --network_media_library_site_id=<value>  [default: 2] the site ID you wish to use for the network media library
      --packagist                              whether or not to create a Private Packagist token for the new project
      --packagist_api_key=<value>              (required) The API key
      --packagist_api_secret=<value>           (required) The API SECRET
      --[no-]sendgrid                          whether or not to create a SendGrid API key for the new project
      --sendgrid_api_key=<value>               (required) the SendGrid API key used to send requests to their API
      --theme_template_branch=<value>          (required) [default: main] theme template branch
      --theme_template_remote=<value>          (required) [default: git@github.com:ItinerisLtd/sage.git] theme template
                                               remote
      --trellis_remote_branch=<value>          [default: main] the branch to use for your new trellis remote
      --trellis_template_branch=<value>        (required) [default: master] trellis template branch
      --trellis_template_remote=<value>        (required) [default: git@github.com:ItinerisLtd/trellis-kinsta.git]
                                               trellis template remote
      --trellis_template_vault_pass=<value>    (required) trellis template vault password

DESCRIPTION
  Create a new project
```

_See code: [src/commands/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/new.ts)_

## `iroots packagist:tokens:delete`

Delete a Packagist token.

```
USAGE
  $ iroots packagist:tokens:delete --apiKey <value> --apiSecret <value> --tokenId <value>

FLAGS
  --apiKey=<value>     (required) The API key
  --apiSecret=<value>  (required) The API SECRET
  --tokenId=<value>    (required) The ID of the token we want to delete

DESCRIPTION
  Delete a Packagist token.

EXAMPLES
  $ iroots packagist:tokens:delete
```

_See code: [src/commands/packagist/tokens/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/packagist/tokens/delete.ts)_

## `iroots packagist:tokens:list`

List all the tokens

```
USAGE
  $ iroots packagist:tokens:list --apiKey <value> --apiSecret <value>

FLAGS
  --apiKey=<value>     (required) The API key
  --apiSecret=<value>  (required) The API SECRET

DESCRIPTION
  List all the tokens

EXAMPLES
  $ iroots packagist:tokens:list
```

_See code: [src/commands/packagist/tokens/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/packagist/tokens/list.ts)_

## `iroots packagist:tokens:new`

Create new token

```
USAGE
  $ iroots packagist:tokens:new --apiKey <value> --apiSecret <value> --description <value> --access read|update
    [--accessToAllPackages] [--teamId <value>] [--expiresAt <value>]

FLAGS
  --access=<option>      (required) [default: read] Type of access the token will have.
                         <options: read|update>
  --accessToAllPackages  Whether or not the token has access to all packages
  --apiKey=<value>       (required) The API key
  --apiSecret=<value>    (required) The API SECRET
  --description=<value>  (required) The description to explain where the token is used.
  --expiresAt=<value>    Time at which the token expires. Example: 2023-11-20T11:36:00+00:00
  --teamId=<value>       The team id to define which packages the token has access to

DESCRIPTION
  Create new token

EXAMPLES
  $ iroots packagist:tokens:new
```

_See code: [src/commands/packagist/tokens/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/packagist/tokens/new.ts)_

## `iroots packagist:tokens:regenerate`

Regenerate a token

```
USAGE
  $ iroots packagist:tokens:regenerate --apiKey <value> --apiSecret <value> --tokenId <value>
    [--IConfirmOldTokenWillStopWorkingImmediately] [--expiresAt <value>]

FLAGS
  --IConfirmOldTokenWillStopWorkingImmediately  The required confirmation field
  --apiKey=<value>                              (required) The API key
  --apiSecret=<value>                           (required) The API SECRET
  --expiresAt=<value>                           Time at which the token expires. Example: 2023-11-20T11:36:00+00:00
  --tokenId=<value>                             (required) The ID of token we want to regenerate.

DESCRIPTION
  Regenerate a token

EXAMPLES
  $ iroots packagist:tokens:regenerate
```

_See code: [src/commands/packagist/tokens/regenerate.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/packagist/tokens/regenerate.ts)_

## `iroots sendgrid:access:delete`

Remove one or more IPs from the allow list

```
USAGE
  $ iroots sendgrid:access:delete --apiKey <value> --rule_id <value>

FLAGS
  --apiKey=<value>      (required) The API key
  --rule_id=<value>...  (required) the IP rule Id

DESCRIPTION
  Remove one or more IPs from the allow list

EXAMPLES
  $ iroots sendgrid:access:delete
```

_See code: [src/commands/sendgrid/access/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/access/delete.ts)_

## `iroots sendgrid:access:get`

Retrieve a specific allowed IP

```
USAGE
  $ iroots sendgrid:access:get --apiKey <value> --rule_id <value>

FLAGS
  --apiKey=<value>   (required) The API key
  --rule_id=<value>  (required) the IP rule Id

DESCRIPTION
  Retrieve a specific allowed IP

EXAMPLES
  $ iroots sendgrid:access:get
```

_See code: [src/commands/sendgrid/access/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/access/get.ts)_

## `iroots sendgrid:access:list`

List allowed IPs in SendGrid account

```
USAGE
  $ iroots sendgrid:access:list --apiKey <value>

FLAGS
  --apiKey=<value>  (required) The API key

DESCRIPTION
  List allowed IPs in SendGrid account

EXAMPLES
  $ iroots sendgrid:access:list
```

_See code: [src/commands/sendgrid/access/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/access/list.ts)_

## `iroots sendgrid:access:new`

Add one or more IPs to the allow list

```
USAGE
  $ iroots sendgrid:access:new --apiKey <value> --ip <value>

FLAGS
  --apiKey=<value>  (required) The API key
  --ip=<value>...   (required) the IP address to whitelist

DESCRIPTION
  Add one or more IPs to the allow list

EXAMPLES
  $ iroots sendgrid:access:new
```

_See code: [src/commands/sendgrid/access/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/access/new.ts)_

## `iroots sendgrid:api-keys:delete`

Delete an API key

```
USAGE
  $ iroots sendgrid:api-keys:delete --apiKey <value> --apiKeyId <value>

FLAGS
  --apiKey=<value>    (required) The API key
  --apiKeyId=<value>  (required) The API key ID

DESCRIPTION
  Delete an API key

EXAMPLES
  $ iroots sendgrid:api-keys:delete
```

_See code: [src/commands/sendgrid/api-keys/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/api-keys/delete.ts)_

## `iroots sendgrid:api-keys:get`

Get information about an API key

```
USAGE
  $ iroots sendgrid:api-keys:get --apiKey <value> --apiKeyId <value>

FLAGS
  --apiKey=<value>    (required) The API key
  --apiKeyId=<value>  (required) The API key ID

DESCRIPTION
  Get information about an API key

EXAMPLES
  $ iroots sendgrid:api-keys:get
```

_See code: [src/commands/sendgrid/api-keys/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/api-keys/get.ts)_

## `iroots sendgrid:api-keys:list`

List API keys in SendGrid account

```
USAGE
  $ iroots sendgrid:api-keys:list --apiKey <value> [--limit <value>]

FLAGS
  --apiKey=<value>  (required) The API key
  --limit=<value>   Specifies the number of results to be returned by the API.

DESCRIPTION
  List API keys in SendGrid account

EXAMPLES
  $ iroots sendgrid:api-keys:list
```

_See code: [src/commands/sendgrid/api-keys/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/api-keys/list.ts)_

## `iroots sendgrid:api-keys:new`

Create an API key

```
USAGE
  $ iroots sendgrid:api-keys:new --apiKey <value> --name <value> --scopes <value>

FLAGS
  --apiKey=<value>     (required) The API key
  --name=<value>       (required) The name you will use to describe this API Key.
  --scopes=<value>...  (required) [default: mail.send] The individual permissions that you are giving to this API Key.
                       See https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/authorization#table-of
                       -contents for available scopes.

DESCRIPTION
  Create an API key

EXAMPLES
  $ iroots sendgrid:api-keys:new
```

_See code: [src/commands/sendgrid/api-keys/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sendgrid/api-keys/new.ts)_

## `iroots sentry:projects:delete`

Delete an API key

```
USAGE
  $ iroots sentry:projects:delete --apiKey <value> --apiKeyId <value>

FLAGS
  --apiKey=<value>    (required) The API key
  --apiKeyId=<value>  (required) The API key ID

DESCRIPTION
  Delete an API key

EXAMPLES
  $ iroots sentry:projects:delete
```

_See code: [src/commands/sentry/projects/delete.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sentry/projects/delete.ts)_

## `iroots sentry:projects:get`

Get information about an API key

```
USAGE
  $ iroots sentry:projects:get --apiKey <value> --apiKeyId <value>

FLAGS
  --apiKey=<value>    (required) The API key
  --apiKeyId=<value>  (required) The API key ID

DESCRIPTION
  Get information about an API key

EXAMPLES
  $ iroots sentry:projects:get
```

_See code: [src/commands/sentry/projects/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sentry/projects/get.ts)_

## `iroots sentry:projects:list`

List projects in Sentry account

```
USAGE
  $ iroots sentry:projects:list --apiKey <value> [--limit <value>]

FLAGS
  --apiKey=<value>  (required) The API key
  --limit=<value>   Specifies the number of results to be returned by the API.

DESCRIPTION
  List projects in Sentry account

EXAMPLES
  $ iroots sentry:projects:list
```

_See code: [src/commands/sentry/projects/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sentry/projects/list.ts)_

## `iroots sentry:projects:new`

Create an API key

```
USAGE
  $ iroots sentry:projects:new --apiKey <value> --name <value> --scopes <value>

FLAGS
  --apiKey=<value>     (required) The API key
  --name=<value>       (required) The name you will use to describe this API Key.
  --scopes=<value>...  (required) [default: mail.send] The individual permissions that you are giving to this API Key.
                       See https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/authorization#table-of
                       -contents for available scopes.

DESCRIPTION
  Create an API key

EXAMPLES
  $ iroots sentry:projects:new
```

_See code: [src/commands/sentry/projects/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/sentry/projects/new.ts)_

## `iroots stackpath:sites:get`

Get an individual site

```
USAGE
  $ iroots stackpath:sites:get --clientId <value> --clientSecret <value> --stackId <value> --siteId <value>

FLAGS
  --clientId=<value>      (required) The API client ID
  --clientSecret=<value>  (required) The API client Secret
  --siteId=<value>        (required) The site ID
  --stackId=<value>       (required) The Stack ID

DESCRIPTION
  Get an individual site

EXAMPLES
  $ iroots stackpath:sites:get
```

_See code: [src/commands/stackpath/sites/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/stackpath/sites/get.ts)_

## `iroots stackpath:sites:list`

Get list of all sites

```
USAGE
  $ iroots stackpath:sites:list --clientId <value> --clientSecret <value> --stackId <value>

FLAGS
  --clientId=<value>      (required) The API client ID
  --clientSecret=<value>  (required) The API client Secret
  --stackId=<value>       (required) The Stack ID

DESCRIPTION
  Get list of all sites

EXAMPLES
  $ iroots stackpath:sites:list
```

_See code: [src/commands/stackpath/sites/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/stackpath/sites/list.ts)_

## `iroots statuscake:uptime:get`

Get information about an uptime monitor

```
USAGE
  $ iroots statuscake:uptime:get --apiKey <value> --test_id <value>

FLAGS
  --apiKey=<value>   (required) The API key
  --test_id=<value>  (required) Uptime check ID

DESCRIPTION
  Get information about an uptime monitor

EXAMPLES
  $ iroots statuscake:uptime:get
```

_See code: [src/commands/statuscake/uptime/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/statuscake/uptime/get.ts)_

## `iroots statuscake:uptime:list`

List uptime monitors

```
USAGE
  $ iroots statuscake:uptime:list --apiKey <value> [--status up|down] [--page <value>] [--limit <value>] [--tags <value>]
    [--matchany] [--nouptime]

FLAGS
  --apiKey=<value>   (required) The API key
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
  $ iroots statuscake:uptime:list
```

_See code: [src/commands/statuscake/uptime/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/statuscake/uptime/list.ts)_

## `iroots statuscake:uptime:new`

Create a new uptime monitor

```
USAGE
  $ iroots statuscake:uptime:new --apiKey <value> --name <value> --website_url <value> [--test_type
    DNS|HEAD|HTTP|PING|SMTP|SSH|TCP] [--check_rate 0|30|60|300|900|1800|3600|86400] [--basic_username <value>]
    [--basic_password <value>] [--confirmation <value>] [--contact_groups <value>] [--custom_header <value>]
    [--do_not_find <value>] [--dns_ips <value>] [--dns_server <value>] [--enable_ssl_alert <value>] [--final_endpoint
    <value>] [--find_string <value>] [--follow_redirects <value>] [--host <value>] [--include_header <value>] [--paused
    <value>] [--port <value>] [--post_body <value>] [--post_raw <value>] [--regions <value>] [--status_codes_csv
    <value>] [--tags <value>] [--timeout <value>] [--trigger_rate <value>] [--use_jar <value>] [--user_agent <value>]

FLAGS
  --apiKey=<value>            (required) The API key
  --basic_password=<value>
  --basic_username=<value>
  --check_rate=<option>       [default: 60] Number of seconds between checks
                              <options: 0|30|60|300|900|1800|3600|86400>
  --confirmation=<value>
  --contact_groups=<value>    List of contact group IDs
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
  --name=<value>              (required) Name of the check
  --paused=<value>
  --port=<value>
  --post_body=<value>
  --post_raw=<value>
  --regions=<value>
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
  $ iroots statuscake:uptime:new
```

_See code: [src/commands/statuscake/uptime/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/src/commands/statuscake/uptime/new.ts)_
<!-- commandsstop -->

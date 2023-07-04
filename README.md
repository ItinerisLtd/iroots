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
iroots/0.0.0 linux-x64 node-v18.16.1
$ iroots --help [COMMAND]
USAGE
  $ iroots COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`iroots help [COMMANDS]`](#iroots-help-commands)
* [`iroots kinsta:sites:get`](#iroots-kinstasitesget)
* [`iroots kinsta:sites:get:environments`](#iroots-kinstasitesgetenvironments)
* [`iroots kinsta:sites:list`](#iroots-kinstasiteslist)
* [`iroots kinsta:sites:new`](#iroots-kinstasitesnew)
* [`iroots new`](#iroots-new)
* [`iroots stackpath:sites:get`](#iroots-stackpathsitesget)
* [`iroots stackpath:sites:list`](#iroots-stackpathsiteslist)
* [`iroots statuscake:uptime:get`](#iroots-statuscakeuptimeget)
* [`iroots statuscake:uptime:list`](#iroots-statuscakeuptimelist)
* [`iroots statuscake:uptime:new`](#iroots-statuscakeuptimenew)

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.11/src/commands/help.ts)_

## `iroots kinsta:sites:get`

describe the command here

```
USAGE
  $ iroots kinsta:sites:get --apiKey <value> --siteId <value>

FLAGS
  --apiKey=<value>  (required) The API key
  --siteId=<value>  (required)

DESCRIPTION
  describe the command here

EXAMPLES
  $ iroots kinsta:sites:get
```

_See code: [dist/commands/kinsta/sites/get/index.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/dist/commands/kinsta/sites/get/index.ts)_

## `iroots kinsta:sites:get:environments`

describe the command here

```
USAGE
  $ iroots kinsta:sites:get:environments --apiKey <value> --siteId <value>

FLAGS
  --apiKey=<value>  (required) The API key
  --siteId=<value>  (required)

DESCRIPTION
  describe the command here

EXAMPLES
  $ iroots kinsta:sites:get:environments
```

_See code: [dist/commands/kinsta/sites/get/environments.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/dist/commands/kinsta/sites/get/environments.ts)_

## `iroots kinsta:sites:list`

describe the command here

```
USAGE
  $ iroots kinsta:sites:list --apiKey <value> --companyId <value>

FLAGS
  --apiKey=<value>     (required) The API key
  --companyId=<value>  (required)

DESCRIPTION
  describe the command here

EXAMPLES
  $ iroots kinsta:sites:list
```

_See code: [dist/commands/kinsta/sites/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/dist/commands/kinsta/sites/list.ts)_

## `iroots kinsta:sites:new`

Create a new Kinsta site

```
USAGE
  $ iroots kinsta:sites:new --apiKey <value> --company <value> --display_name <value> --region
    asia-east1|asia-east2|asia-northeast1|asia-northeast2|asia-northeast3|asia-south1|asia-south2|asia-southeast1|asia-s
    outheast2|australia-southeast1|australia-southeast2|europe-central2|europe-north1|europe-southwest1|europe-west1|eur
    ope-west2|europe-west3|europe-west4|europe-west6|europe-west8|europe-west9|me-west1|northamerica-northeast1|northame
    rica-northeast2|southamerica-east1|southamerica-west1|us-central1|us-east1|us-east4|us-east5|us-south1|us-west1|us-w
    est2|us-west3|us-west4 --install_mode new|plain --is_subdomain_multisite --admin_email <value> --admin_password
    <value> --admin_user <value> --is_multisite --site_title <value> --woocommerce --wordpressseo --wp_language <value>

FLAGS
  --admin_email=<value>
      (required) [default: wordpress@itineris.co.uk]

  --admin_password=<value>
      (required) [default: 2347c7e8e7238813c8266ddf05d3c4205fe015571a11f35cc060b716080fa40120374d2d800bdb778c0824f8cbd550a
      f68ae368aa47cd7f47a58082ed7f83b7a28f3a866d9a35a7be99690db302c7048381a13372af87bfac0bb7091ad8c917fc4fdd7863e61e0347b1
      cbae3a199a604e9e7fd07b40f1d2b3745e7e60adfe5bf6110a849ea593d83baed4db5fda35e443210c53566855d124c8d53487d6764efe68e2ae
      83d20dacb61449b8cc6a20a2968830f12d2701941dac145398eb9850670d1d15cc40989e36ba0d053095e5054197a636fb82369c22f56616a3ec
      b1d63adbdcea1f9501115460389d6d555f8b3dd7dcb1b5b4c9658a92eadc66d575119]

  --admin_user=<value>
      (required) [default: itineris]

  --apiKey=<value>
      (required) The API key

  --company=<value>
      (required)

  --display_name=<value>
      (required)

  --install_mode=<option>
      (required) [default: plain]
      <options: new|plain>

  --is_multisite
      (required)

  --is_subdomain_multisite
      (required)

  --region=<option>
      (required) [default: europe-west2]
      <options: asia-east1|asia-east2|asia-northeast1|asia-northeast2|asia-northeast3|asia-south1|asia-south2|asia-southea
      st1|asia-southeast2|australia-southeast1|australia-southeast2|europe-central2|europe-north1|europe-southwest1|europe
      -west1|europe-west2|europe-west3|europe-west4|europe-west6|europe-west8|europe-west9|me-west1|northamerica-northeast
      1|northamerica-northeast2|southamerica-east1|southamerica-west1|us-central1|us-east1|us-east4|us-east5|us-south1|us-
      west1|us-west2|us-west3|us-west4>

  --site_title=<value>
      (required)

  --woocommerce
      (required)

  --wordpressseo
      (required)

  --wp_language=<value>
      (required) [default: en_GB]

DESCRIPTION
  Create a new Kinsta site

EXAMPLES
  $ iroots kinsta:sites:new
```

_See code: [dist/commands/kinsta/sites/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/dist/commands/kinsta/sites/new.ts)_

## `iroots new`

describe the command here

```
USAGE
  $ iroots new -s <value> -b <value> --bedrock_repo_pat <value> -t <value> --bedrock_template_remote
    <value> --bedrock_template_branch <value> --trellis_template_remote <value> --trellis_template_branch <value>
    --theme_template_remote <value> --theme_template_branch <value> --trellis_template_vault_pass <value> [-h] [-d] [-l]
    [--git_push] [--github] [--github_team <value>] [--github_team_permission <value>] [--bedrock_remote_branch <value>]
    [--trellis_remote_branch <value>]

FLAGS
  -b, --bedrock_remote=<value>           (required) bedrock importremote
  -d, --[no-]deploy                      whether to deploy or not
  -h, --help                             Show CLI help.
  -l, --[no-]local                       whether to setup local site or not
  -s, --site=<value>                     (required) site key
  -t, --trellis_remote=<value>           (required) trellis remote
  --bedrock_remote_branch=<value>        [default: main] the branch to use for your new bedrock remote
  --bedrock_repo_pat=<value>             (required) the bedrock personal access token for GitHub Actions to clone
                                         trellis
  --bedrock_template_branch=<value>      (required) [default: master] bedrock template branch
  --bedrock_template_remote=<value>      (required) [default: git@github.com:ItinerisLtd/bedrock.git] bedrock template
                                         remote
  --[no-]git_push                        whether to push to git remotes or not
  --[no-]github                          whether to use GH CLI/API or not
  --github_team=<value>                  [default: php-team] the team to add to the created GitHub repositories
  --github_team_permission=<value>       [default: maintain] the permission to set for the specified GitHub team
  --theme_template_branch=<value>        (required) [default: main] theme template branch
  --theme_template_remote=<value>        (required) [default: git@github.com:ItinerisLtd/sage.git] theme template remote
  --trellis_remote_branch=<value>        [default: main] the branch to use for your new trellis remote
  --trellis_template_branch=<value>      (required) [default: master] trellis template branch
  --trellis_template_remote=<value>      (required) [default: git@github.com:ItinerisLtd/trellis-kinsta.git] trellis
                                         template remote
  --trellis_template_vault_pass=<value>  (required) trellis template vault password

DESCRIPTION
  describe the command here
```

_See code: [dist/commands/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/dist/commands/new.ts)_

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

_See code: [dist/commands/stackpath/sites/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/dist/commands/stackpath/sites/get.ts)_

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

_See code: [dist/commands/stackpath/sites/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/dist/commands/stackpath/sites/list.ts)_

## `iroots statuscake:uptime:get`

describe the command here

```
USAGE
  $ iroots statuscake:uptime:get --apiKey <value> --test_id <value>

FLAGS
  --apiKey=<value>   (required) The API key
  --test_id=<value>  (required) Uptime check ID

DESCRIPTION
  describe the command here

EXAMPLES
  $ iroots statuscake:uptime:get
```

_See code: [dist/commands/statuscake/uptime/get.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/dist/commands/statuscake/uptime/get.ts)_

## `iroots statuscake:uptime:list`

describe the command here

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
  describe the command here

EXAMPLES
  $ iroots statuscake:uptime:list
```

_See code: [dist/commands/statuscake/uptime/list.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/dist/commands/statuscake/uptime/list.ts)_

## `iroots statuscake:uptime:new`

describe the command here

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
  describe the command here

EXAMPLES
  $ iroots statuscake:uptime:new
```

_See code: [dist/commands/statuscake/uptime/new.ts](https://github.com/itinerisltd/iroots/blob/v0.0.0/dist/commands/statuscake/uptime/new.ts)_
<!-- commandsstop -->

import {ux} from '@oclif/core'
import {execa, ExecaError} from 'execa'

export async function dbCreate(options = {}): Promise<boolean> {
  try {
    await execa('wp', ['db', 'create'], options)
    return true
  } catch (error) {
    if (error instanceof ExecaError && 'stdout' in error) {
      ux.stdout(error?.stdout)
    }

    return false
  }
}

export const multisiteConfigTemplate = `
/**
 * Multisite
 *
 * @see https://roots.io/docs/trellis/master/multisite/
 */
Config::define('WP_ALLOW_MULTISITE', true);
Config::define('MULTISITE', true);
Config::define('SUBDOMAIN_INSTALL', true);
Config::define('DOMAIN_CURRENT_SITE', env('DOMAIN_CURRENT_SITE'));
Config::define('PATH_CURRENT_SITE', env('PATH_CURRENT_SITE') ?: '/');
Config::define('SITE_ID_CURRENT_SITE', env('SITE_ID_CURRENT_SITE') ?: 1);
Config::define('BLOG_ID_CURRENT_SITE', env('BLOG_ID_CURRENT_SITE') ?: 1);
Config::define('WP_CORE_DIRECTORY', 'wp');
if (! (defined('WP_CLI') && WP_CLI)) {
    Config::define('COOKIE_DOMAIN', $_SERVER['HTTP_HOST']);
}`

export const multisiteNetworkMediaLibrarySiteIdFilter = (siteId = 1): string => `
/**
 * Set the ID of which site to get network media from.
 * Typically, ID 1 will be the "main/group" site
 * and ID 2 will be the special "media" site.
 * Change this if it does not fit your requirements.
 */
add_filter('network-media-library/site_id', fn (): int => ${siteId});
`

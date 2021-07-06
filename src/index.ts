import { existsSync } from 'fs'

import { build, postProcess } from './generate'
import { fromJSON } from './transform'
import { check } from './security'
import { processOptions } from './options'
import { loadFile } from './json-utils'
import {
  ApplicationFn,
  ConfigOptions,
  ProcessedMetadata,
  _Config,
} from './types'

export {
  ApplicationFn,
  ConfigOptions,
  GitBranchTestFunction,
  GitOptions,
  JSONObject,
  JSONValue,
  MergeOptions,
  PackageInfo,
  ProcessedMetadata,
  ReleaseMetadata,
  RepoInfo,
  SecureReleaseMetadata,
  SecureRepoInfo,
  SecurityFilterFn,
  SecurityOptions,
} from './types'

/**
 * Provide release metadata for an application.
 *
 * ```json
 * {
 *   "name": "release-metadata-ts",
 *   "timestamp": "20210706195814",
 *   "repos": [
 *     {
 *       "ref": "b7ebeb23c2dfbd9bba637a91cccfaa2fe0860108",
 *       "url": "https://github.com/KineticCafe/release-metadata-ts.git",
 *       "name": "release-metadata-ts",
 *       "type": "git",
 *       "source_path": "/Users/austin/dev/oss/kineticcafe/release-metadata/release-metadata-ts"
 *     }
 *   ],
 *   "source_path": "/Users/austin/dev/oss/kineticcafe/release-metadata/release-metadata-ts",
 *   "packages": [
 *     {
 *       "name": "node",
 *       "versions": {
 *         "node": "16.4.0",
 *         "v8": "9.1.269.36-node.14",
 *         "uv": "1.41.0",
 *         "zlib": "1.2.11",
 *         "brotli": "1.0.9",
 *         "ares": "1.17.1",
 *         "modules": "93",
 *         "nghttp2": "1.43.0",
 *         "napi": "8",
 *         "llhttp": "6.0.2",
 *         "openssl": "1.1.1k",
 *         "cldr": "39.0",
 *         "icu": "69.1",
 *         "tz": "2021a",
 *         "unicode": "13.0"
 *       }
 *     }
 *   ]
 * }
 * ```
 *
 * Initialize `ReleaseMetadata` once in your application so that it can be
 * retrieved for later use.
 *
 * ```js
 * // ./release-metadata.mjs
 * import { create } from '@kineticcafe/release-metadata'
 *
 * export const releaseMetadata = create()
 * ```
 *
 * The output of `ReleaseMetadata.create()` is an async function that returns
 * a release metadata map.
 *
 * Use `ReleaseMetadata` in an application module so that it can be retrieved
 * for your application. You may wish to filter the data before returning it to
 * external clients, such as this for an express app:
 *
 * ```js
 * import releaseMetadata from './release-metadata'
 *
 * express.get('/release', async (_req, res, _next) => {
 *   res.send(await releaseMetadata())
 * })
 * ```
 */
export const create = (options?: ConfigOptions): ApplicationFn => {
  const config: _Config = processOptions('application', options)

  return async (): Promise<ProcessedMetadata> => {
    const fileExists = existsSync(config.path)

    if (check('requireFile', config) && !fileExists) {
      throw new Error(
        `secure.requireFile is enabled, but ${config.path} does not exist`
      )
    }

    const metadata = fileExists
      ? fromJSON(loadFile(config.path))
      : await build('application', config)

    return postProcess(metadata, config)
  }
}

/**
 * Build a
 */
export const generate = async (
  options?: ConfigOptions
): Promise<ProcessedMetadata> => {
  const config: _Config = processOptions('command-line', options)

  return postProcess(await build('command-line', config), config)
}

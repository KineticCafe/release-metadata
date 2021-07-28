import { existsSync } from 'fs'

import { build, postProcess, resolve } from './generate'
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
 * Creates an async function that returns a processed release metadata map.
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
      : build('application', config)

    return postProcess(metadata, config)
  }
}

/**
 * Creates a static processed release metadata map.
 */
export const createStatic = (options?: ConfigOptions): ProcessedMetadata => {
  const config: _Config = processOptions('application', options)
  const fileExists = existsSync(config.path)

  if (check('requireFile', config) && !fileExists) {
    throw new Error(
      `secure.requireFile is enabled, but ${config.path} does not exist`
    )
  }

  const metadata = fileExists
    ? fromJSON(loadFile(config.path))
    : buildSync('application', config)

  return postProcess(metadata, config)
}

/**
 * Build a release metadata object.
 */
export const generate = (options?: ConfigOptions): ProcessedMetadata =>
  resolve('command-line', options)

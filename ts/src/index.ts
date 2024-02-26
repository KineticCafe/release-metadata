import { existsSync } from 'fs'

import { build, postProcess, resolve } from './generate'
import { loadFile } from './json-utils'
import { processOptions } from './options'
import { check } from './security'
import { fromJSON } from './transform'
import { ApplicationFn, ConfigInternal, ConfigOptions, ProcessedMetadata } from './types'

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
  const config: ConfigInternal = processOptions('application', options)

  return async (): Promise<ProcessedMetadata> => {
    const fileExists = existsSync(config.path)

    if (check('requireFile', config) && !fileExists) {
      throw new Error(`secure.requireFile is enabled, but ${config.path} does not exist`)
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
  const config: ConfigInternal = processOptions('application', options)
  const fileExists = existsSync(config.path)

  if (check('requireFile', config) && !fileExists) {
    throw new Error(`secure.requireFile is enabled, but ${config.path} does not exist`)
  }

  const metadata = fileExists
    ? fromJSON(loadFile(config.path))
    : build('application', config)

  return postProcess(metadata, config)
}

/**
 * Build a release metadata object.
 */
export const generate = (options?: ConfigOptions): ProcessedMetadata =>
  resolve('command-line', processOptions('command-line', options))

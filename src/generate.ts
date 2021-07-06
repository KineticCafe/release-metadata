import { check } from './security'
import { merge, secured } from './transform'
import { git } from './git'
import { processOptions } from './options'
import {
  ConfigOptions,
  Mode,
  PackageInfo,
  ProcessedMetadata,
  ReleaseMetadata,
  RepoInfo,
  _Config,
} from './types'

/**
 * Build a release metadata object for the current repository.
 */
export const build = async (
  mode: Mode,
  options?: _Config
): Promise<ReleaseMetadata> => {
  const opts: _Config = processOptions(mode, options)

  if (mode === 'application' && check('requireFile', opts)) {
    throw new Error('Release Metadata generation is not allowed in secure mode')
  }

  const info: undefined | RepoInfo = await git(opts.git)

  return format(info, opts)
}

export const resolve = async (
  mode: Mode,
  options: ConfigOptions
): Promise<ProcessedMetadata> => {
  const config: _Config = processOptions(mode, options)
  return postProcess(await build(mode, config), config)
}

export const postProcess = (
  metadata: ReleaseMetadata,
  config: _Config
): ProcessedMetadata => secured(merge(metadata, config), config)

const format = (
  info: RepoInfo | undefined,
  options: _Config
): ReleaseMetadata => {
  const repos = info ? [info] : []
  const thisPackage: PackageInfo = {
    name: process.release.name,
    versions: {},
  }

  for (const key in process.versions) {
    if (process.versions[key]) {
      thisPackage.versions[key] = process.versions[key] as string
    }
  }

  const packages = [thisPackage]

  return {
    name: options?.name ?? info?.name ?? null,
    timestamp: options.timestamp,
    source_path: process.cwd(),
    repos,
    packages,
  }
}

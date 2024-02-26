import { git } from './git'
import { processOptions } from './options'
import { check } from './security'
import { merge, secured } from './transform'
import {
  ConfigInternal,
  ConfigOptions,
  Mode,
  PackageInfo,
  ProcessedMetadata,
  ReleaseMetadata,
  RepoInfo,
} from './types'

/**
 * Build a release metadata object for the current repository.
 */
export const build = (mode: Mode, options?: ConfigInternal): ReleaseMetadata => {
  const opts: ConfigInternal = processOptions(mode, options)

  if (mode === 'application' && check('requireFile', opts)) {
    throw new Error('Release Metadata generation is not allowed in secure mode')
  }

  const info: undefined | RepoInfo = git(opts.git)

  return format(info, opts)
}

export const resolve = (mode: Mode, options: ConfigOptions): ProcessedMetadata => {
  const config: ConfigInternal = processOptions(mode, options)
  return postProcess(build(mode, config), config)
}

export const postProcess = (
  metadata: ReleaseMetadata,
  config: ConfigInternal,
): ProcessedMetadata => secured(merge(metadata, config), config)

const format = (info: RepoInfo | undefined, options: ConfigInternal): ReleaseMetadata => {
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

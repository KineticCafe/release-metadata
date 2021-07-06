import { isAbsolute, join } from 'path'
import { existsSync, statSync } from 'fs'

import {
  ConfigOptions,
  GitBranchTestFunction,
  GitOptions,
  MergeOptions,
  Mode,
  SecurityOptions,
  _Config,
  _Git,
  _Merge,
  _Security,
} from './types'

export const processOptions = (
  mode: Mode,
  options?: ConfigOptions
): _Config => {
  return {
    git: resolveGit(options?.git),
    merge: resolveMerge(options?.merge),
    secure: resolveSecurity(mode, options?.secure),
    name: options?.name,
    timestamp: timestamp(options?.timestamp),
    path: resolvePath(options?.path),
  }
}

export const resolvePath = (path?: string): string => {
  const cwd = process.cwd()

  if (path == null) {
    return join(cwd, 'release-metadata.json')
  }

  const newPath = isAbsolute(path) ? path : join(cwd, path)

  return existsSync(newPath)
    ? statSync(newPath).isDirectory()
      ? join(newPath, 'release-metadata.json')
      : newPath
    : newPath
}

const defaultBranchTest = (mainBranch?: string): GitBranchTestFunction =>
  mainBranch
    ? (branch: string): boolean => branch === mainBranch
    : (branch: string): boolean => branch === 'main' || branch === 'master'

const resolveGit = (git?: boolean | GitOptions): _Git => {
  const branchTest = defaultBranchTest()

  return git === false
    ? {
        branchTest,
        enabled: false,
        remote: undefined,
      }
    : git === true || git == null
    ? {
        branchTest,
        enabled: true,
        remote: 'origin',
      }
    : {
        branchTest: git.branchTest ?? defaultBranchTest(git.branch),
        enabled: git.enabled ?? true,
        remote: git.remote ?? 'origin',
      }
}

const resolveMerge = (merge?: MergeOptions): _Merge => {
  return { original: merge?.original ?? {}, overlay: merge?.overlay ?? {} }
}

const resolveSecurity = (
  mode: Mode,
  secure?: boolean | SecurityOptions
): _Security => {
  if (secure == null) {
    secure = mode === 'application'
  }

  switch (secure) {
    case false: {
      return {
        enabled: false,
        env: undefined,
        filter: undefined,
        omitRepoUrl: undefined,
        requireFile: undefined,
      }
    }
    case true: {
      return {
        enabled: true,
        env: mode === 'application' ? { production: true } : false,
        filter: undefined,
        omitRepoUrl: false,
        requireFile: mode === 'application',
      }
    }
    default: {
      return {
        enabled: secure.enabled ?? true,
        env: secure.env === true ? { production: true } : secure.env,
        filter: secure.filter,
        omitRepoUrl: secure.omitRepoUrl ?? false,
        requireFile:
          secure.requireFile == null
            ? mode === 'application'
            : secure.requireFile,
      }
    }
  }
}

const timestamp = (timestamp?: string): string =>
  timestamp ?? process.env.RELEASE_TIMESTAMP ?? currentTimestamp()

const currentTimestamp = (): string =>
  new Date()
    .toISOString()
    .replace(/\.\d+Z$/g, '')
    .replace(/\D/g, '')

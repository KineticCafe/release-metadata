import { existsSync, statSync } from 'fs'
import { isAbsolute, join } from 'path'

import {
  ConfigInternal,
  ConfigOptions,
  GitBranchTestFunction,
  GitInternal,
  GitOptions,
  MergeInternal,
  MergeOptions,
  Mode,
  SecurityInternal,
  SecurityOptions,
} from './types'

export const processOptions = (mode: Mode, options?: ConfigOptions): ConfigInternal => {
  validateMode(mode)

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

const validateMode = (mode: Mode): void => {
  switch (mode as string) {
    case 'application':
    case 'command-line': {
      return
    }
    default: {
      throw new Error(`Invalid mode '${mode}' provided.`)
    }
  }
}

const defaultBranchTest = (mainBranch?: string): GitBranchTestFunction =>
  mainBranch
    ? (branch: string): boolean => branch === mainBranch
    : (branch: string): boolean => branch === 'main' || branch === 'master'

const resolveGit = (git?: boolean | GitOptions): GitInternal => {
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

const resolveMerge = (merge?: MergeOptions): MergeInternal => {
  return { original: merge?.original ?? {}, overlay: merge?.overlay ?? {} }
}

const resolveSecurity = (
  mode: Mode,
  security?: boolean | SecurityOptions,
): SecurityInternal => {
  const secure = security == null ? mode === 'application' : security

  switch (secure) {
    case false: {
      return {
        enabled: false,
        env: false,
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
        env:
          secure.env === true
            ? { production: true }
            : typeof secure.env === 'string'
              ? { [secure.env]: true }
              : typeof secure.env === 'object'
                ? (secure.env as { [key: string]: boolean })
                : false,
        filter: typeof secure.filter === 'function' ? secure.filter : undefined,
        omitRepoUrl: secure.omitRepoUrl ?? false,
        requireFile:
          secure.requireFile == null
            ? mode === 'application'
            : Boolean(secure.requireFile),
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

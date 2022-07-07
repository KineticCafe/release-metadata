import { execSync } from 'child_process'
import { basename, resolve } from 'path'

import { GitInternal, RepoInfo } from './types'

export const git = (options: GitInternal): undefined | RepoInfo => {
  if (options.enabled === false) {
    return undefined
  }

  const url: string = gitUrl(options.remote)

  return {
    name: name(url),
    ref: gitRef(options),
    source_path: gitToplevelPath(),
    type: 'git',
    url,
  }
}

const name = (url: string): string => basename(url, '.git')

const gitToplevelPath = (): string =>
  resolve(process.cwd(), runGit('rev-parse', '--show-toplevel'))

const gitUrl = (remote?: string): string => {
  try {
    return gitRemoteGetUrl(remote ?? 'origin')
  } catch {
    return 'UNKNOWN'
  }
}

const gitRemoteGetUrl = (remote: string): string => {
  try {
    return runGit('remote', 'get-url', remote)
  } catch {
    return gitRemoteShow(remote)
  }
}

const gitRemoteShow = (remote: string): string =>
  parseFetchUrl(runGit('remote', 'show', '-n', remote))

const parseFetchUrl = (url: string): string => {
  const match = url.match(/\n\s+Fetch URL: (?<fetch>[^\n]+)/)
  const groups = match?.groups

  return groups?.fetch ?? 'UNKNOWN'
}

const gitRef = (options: GitInternal): string => {
  try {
    return gitRefWithBranch(runGit('rev-parse', 'HEAD'), options)
  } catch {
    return 'UNKNOWN'
  }
}

const gitRefWithBranch = (ref: string, options: GitInternal): string => {
  try {
    const branch: string = runGit('symbolic-ref', '--quiet', '--short', 'HEAD')

    if (options.branchTest(branch)) {
      return ref
    }

    return `${branch} (${ref})`
    // return options.branchTest(branch) ? ref : `${branch} (${ref})`
  } catch {
    return ref
  }
}

const runGit = (...args: string[]): string =>
  execSync(`git ${args.join(' ')}`)
    .toString()
    .trim()

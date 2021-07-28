import { execSync } from 'child_process'
import { basename, resolve } from 'path'

import { _Git, RepoInfo } from './types'

export const git = (options: _Git): undefined | RepoInfo => {
  if (options.enabled === false) {
    return undefined
  }

  const url: string = gitUrl(options.remote)

  return {
    name: name(url),
    ref: gitRef(options),
    source_path: gitPath(),
    type: 'git',
    url,
  }
}

const name = (url?: string): undefined | string =>
  url ? basename(url, '.git') : undefined

const gitPath = (): string =>
  resolve(process.cwd(), runGit('rev-parse', '--show-cdup'))

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

const gitRef = (options: _Git): string => {
  try {
    return gitRefWithBranch(runGit('rev-parse', 'HEAD'), options)
  } catch {
    return 'UNKNOWN'
  }
}

const gitRefWithBranch = (ref: string, options: _Git): string => {
  try {
    const branch: string = runGit('symbolic-ref', '--quiet', '--short', 'HEAD')

    return options.branchTest(branch) ? ref : `${branch} (${ref})`
  } catch {
    return ref
  }
}

const runGit = (...args: string[]): string =>
  execSync(`git ${args.join(' ')}`)
    .toString()
    .trim()

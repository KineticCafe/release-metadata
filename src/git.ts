import { exec } from 'child_process'
import { promisify } from 'util'
import { basename, resolve } from 'path'

import { _Git, RepoInfo } from './types'

const run = promisify(exec)

export const git = async (options: _Git): Promise<undefined | RepoInfo> => {
  if (options.enabled === false) {
    return undefined
  }

  const url: string = await gitUrl(options.remote)

  return {
    name: name(url),
    ref: await gitRef(options),
    source_path: await gitPath(),
    type: 'git',
    url,
  }
}

const name = (url?: string): undefined | string =>
  url ? basename(url, '.git') : undefined

type ExecResult = {
  stdout: string | Buffer
}

const gitPath = async (): Promise<string> => {
  const relativePath = await runGit('rev-parse', '--show-cdup')

  return resolve(process.cwd(), relativePath)
}

const gitUrl = async (remote?: string): Promise<string> => {
  try {
    return gitRemoteGetUrl(remote ?? 'origin')
  } catch {
    return 'UNKNOWN'
  }
}

const gitRemoteGetUrl = async (remote: string): Promise<string> => {
  try {
    return await runGit('remote', 'get-url', remote)
  } catch {
    return await gitRemoteShow(remote)
  }
}

const gitRemoteShow = async (remote: string): Promise<string> => {
  const url: string = await runGit('remote', 'show', '-n', remote)

  return parseFetchUrl(url)
}

const parseFetchUrl = (url: string): string => {
  const match = url.match(/\n\s+Fetch URL: (?<fetch>[^\n]+)/)
  const groups = match?.groups

  return groups?.fetch ?? 'UNKNOWN'
}

const gitRef = async (options: _Git): Promise<string> => {
  try {
    const ref: string = await runGit('rev-parse', 'HEAD')

    return gitRefWithBranch(ref, options)
  } catch {
    return 'UNKNOWN'
  }
}

const gitRefWithBranch = async (
  ref: string,
  options: _Git
): Promise<string> => {
  try {
    const branch: string = await runGit(
      'symbolic-ref',
      '--quiet',
      '--short',
      'HEAD'
    )

    return options.branchTest(branch) ? ref : `${branch} (${ref})`
  } catch {
    return ref
  }
}

const runGit = async (...args: string[]): Promise<string> => {
  try {
    const result: ExecResult = await run(`git ${args.join(' ')}`)
    const stdout = result.stdout

    return (stdout as string).trim()
  } catch (error) {
    const stderr = error.stderr
    const stdout = error.stdout
    const message = stderr + '' || stdout + '' || 'Error from git'

    throw new Error(message)
  }
}

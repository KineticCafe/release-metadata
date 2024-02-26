import { writeFileSync } from 'fs'
import { Command } from 'commander'

import { version as VERSION } from '../package.json'
import { resolve } from './generate'
import { loadFile } from './json-utils'
import { resolvePath } from './options'
import { ConfigOptions, JSONObject } from './types'

export const program = (): Command =>
  new Command()
    .createCommand()
    .version(VERSION)
    .option('--path <PATH>', 'The path and/or filename for the metadata (implies --save)')
    .option('--save', 'Writes release-metadata.json to the current directory')
    .option(
      '--no-save',
      'Prints to standard output instead of saving, used with --path for reading only',
    )
    .option(
      '--merge [ORIGINAL]',
      'Merges the generated release metadata with an existing file, uses the value of --path unless ORIGINAL is provided; if ORIGINAL is provided, the file must exist; incompatible with --merge-original',
    )
    .option(
      '--merge-original <ORIGINAL>',
      'Merges the generated release metadata with the original file',
    )
    .option(
      '--merge-overlay <OVERLAY>',
      'Merges the overlay file with the generated release metadata',
    )
    .option('--branch <BRANCH>', 'The default git branch to use, if not main or master')
    .option('--remote <REMOTE>', 'The default git remote to use, if not origin')
    .option('--no-git', 'Disables git processing')
    .option('--secure', 'Resolves only to a secure version of the output')
    .option(
      '--secure-if-production',
      'Resolves to a secure version if NODE_ENV is production',
    )
    .option('--omit-repo-url', 'Eliminates the repo URL')
    .option('--release-name <NAME>', 'The value to use as the release name')
    .option('--timestamp <TIMESTAMP>', 'The timestamp to use')
    .action(run)

interface RawCliConfig {
  path?: string
  save?: boolean
  merge?: string | boolean
  branch?: string
  remote?: string
  git?: boolean
  mergeOriginal?: string
  mergeOverlay?: string
  secure?: boolean
  omitRepoUrl?: boolean
  secureIfProduction?: boolean
  releaseName?: string
  timestamp?: string
}

const run = (options: RawCliConfig): void => {
  const path = resolvePath(options.path)

  if (options.merge && options.mergeOriginal) {
    throw new Error('Cannot specify both --merge and --merge-original')
  }

  /* The original file does not need to exist if just using `--merge`. */
  const original =
    options.merge === true
      ? loadFile(path, true)
      : loadFile(options.mergeOriginal ?? options.merge)

  const overlay = loadFile(options.mergeOverlay)

  const config: ConfigOptions = {
    git: {
      branch: options.branch,
      enabled: options.git,
      remote: options.remote,
    },
    merge: { original, overlay },
    path,
    secure: {
      enabled: Boolean(options.secure),
      env: Boolean(options.secureIfProduction),
      omitRepoUrl: Boolean(options.omitRepoUrl),
    },
    name: options.releaseName,
    timestamp: options.timestamp,
  }

  const resolved = resolve('command-line', config)

  save(resolved, { path, save: Boolean(options.save) })
}

const save = (value: JSONObject, config: { path: string; save: boolean }): void => {
  if (config.save) {
    writeFileSync(config.path, JSON.stringify(value))
  } else {
    console.log(JSON.stringify(value, null, 2))
  }
}

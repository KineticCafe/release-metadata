/**
 * Any possible JSON value.
 */
export type JSONValue =
  | JSONValue[]
  | boolean
  | null
  | number
  | string
  | undefined
  | { [key: string]: JSONValue }

/**
 * An object containing JSON values.
 */
export type JSONObject = { [key: string]: JSONValue }

/**
 * A secure description of a codebase repository for a release.
 */
export type SecureRepoInfo = {
  /**
   * The ref of the codebase. For `git` repositories, may include the current
   * branch name if on a branch that is not the main branch. The secure
   * representation will always omit the current branch name.
   */
  ref: string
  /**
   * The repo URL for the repository. The secure representation is the base part
   * of the remote URL for the repository. That is, if the remote repository is
   * `https://github.com/KineticCafe/release-metadata-ts.git`, the base part
   * will be `release-metadata-ts`. This would be enough to identify the source
   * repo for project members but would typically not be enough to provide
   * a possible attack vector.
   *
   * Security options can be set to omit this value entirely.
   */
  url?: string | null
}

/**
 * A description of a codebase repository for a release.
 */
export type RepoInfo = SecureRepoInfo & {
  /**
   * The name of the repo, derived from the base part of repo URL of the
   * repository. That is, if the remote repository is
   * `https://github.com/KineticCafe/release-metadata-ts.git`, the base part
   * will be `release-metadata-ts`.
   */
  name?: string | null
  /**
   * The type of repository. Currenly only `git` is supported.
   */
  type: string
  /**
   * The source path for the repository.
   */
  source_path: string
  /**
   * Optional extensions to repository info.
   */
  ext?: JSONObject
}

/**
 * A description of the package runtime for this release. Note that there is no
 * secure representation of package runtime, so it will be omitted with default
 */
export type PackageInfo = {
  /**
   * The name of the runtime or language. Can be any value, but by default will
   * be `node` when created by the node version of ReleaseMetadata.
   */
  name: string
  /**
   * A collection of runtime version strings. Typically the output of
   * `process.versions`.
   */
  versions: {
    /**
     * A map of version type and version.
     */
    [key: string]: string
  }
  /**
   * Optional extensions to Package Info.
   */
  ext?: JSONObject
}

/**
 * A secure subset of release metadata.
 */
export type SecureReleaseMetadata = {
  /**
   * The name of the release. May be omitted, but this is not recommended.
   */
  name?: string | null
  /**
   * A timestamp that describes the whole release.
   */
  timestamp: string
  /**
   * The repositories used to construct this release.
   */
  repos: SecureRepoInfo[]
}

/**
 * A resolved ReleaseMetadata structure.
 */
export type ReleaseMetadata = SecureReleaseMetadata & {
  /**
   * The primary source path for the release.
   */
  source_path: string
  /**
   * The packages or runtimes for the release.
   */
  packages: PackageInfo[]
  /**
   * The repositories used to construct this release.
   */
  repos: RepoInfo[]
  /**
   * Optional extensions to release metadata.
   */
  ext?: JSONObject
}

export type ProcessedMetadata =
  | SecureReleaseMetadata
  | ReleaseMetadata
  | JSONObject
export type ApplicationFn = () => Promise<ProcessedMetadata>

/**
 * A function to automatically filter release metadata as part of the security
 * process. It is provided both the prefiltered release metadata and the
 * original metadata and is expected to return any JSON-shaped object.
 */
export type SecurityFilterFn = (
  _secured: SecureReleaseMetadata,
  _metadata: JSONObject
) => JSONObject

export type PartialRepoInfo = {
  ref?: string
  url?: string | null
  name?: string | null
  type?: string
  source_path?: string
  ext?: JSONObject
}

export type PartialPackageInfo = {
  name?: string
  versions?: { [key: string]: string }
  ext?: JSONObject
}

export type PartialReleaseMetadata = {
  name?: string | null
  timestamp?: string
  repos?: PartialRepoInfo[]
  source_path?: string
  packages?: PartialPackageInfo[]
  ext?: JSONObject
}

export type GitBranchTestFunction = (_branch: string) => boolean

/**
 * Options to configure how we interact with git.
 */
export type GitOptions = {
  /**
   * Sets the default branch that will not be included as part of the hashref.
   * If not present, defaults to one of `main` or `master`.
   *
   * Can be set from the command-line with `--branch <branch>`.
   */
  branch?: string
  /**
   * Tests to see if the branch provided is the default branch. If provided,
   * `branch` will be ignored.
   */
  branchTest?: GitBranchTestFunction
  /**
   * Sets the default remote to find the repo URL from. If not present,
   * defaults to `origin`.
   *
   * Can be set from the command-line with `--remote <remote>`.
   */
  remote?: string
  /**
   * If `false`, disables git collection (can be set to `false` with `--no-git`
   * from the command-line).
   */
  enabled?: boolean
}

/**
 * Options to configure how and whether the release metadata will be merged
 * with the generated metadata using a deep merge.
 */
export type MergeOptions = {
  /**
   * The original object to overlay with generated metadata. The original object
   * will be coerced into a {@link ReleaseMetadata} shape prior to merging.
   *
   * Can be specified from the command-line as either `--merge` (uses the
   * currently written `release-metadata.json`), `--merge original.json` (uses
   * the file `original.json`), or `--merge-original original.json` (uses the
   * file `original.json`).
   */
  original?: JSONObject
  /**
   * The an object to overlay the generated metadata. The overlay object
   * will be coerced into a {@link ReleaseMetadata} shape prior to merging.
   *
   * Can be specified from the command-line as `--merge-overlay overlay.json`.
   */
  overlay?: JSONObject
}

/**
 * Security options.
 */
export type SecurityOptions = {
  /**
   * Omits the repo URL entirely if this is `true`. By default, a safe
   * If present and `true`, the repo URL will be omitted.
   */
  omitRepoUrl?: boolean
  /**
   * Use this function to filter release metadata.
   */
  filter?: SecurityFilterFn
  /**
   * If `true` when running in `application` mode, a release metadata file must
   * exist or an error will be printed if it is missing. Ignored in
   * `command-line` mode.
   *
   * Defaults to `true` if security is enabled.
   */
  requireFile?: boolean
  /**
   * Enables security options based on the value of `NODE_ENV` as matched in
   * this. If `true`, security options will be enabled when `NODE_ENV` is
   * `production`.
   */
  env?: { [key: string]: boolean } | boolean
  /**
   * If `false`, disables security processing.
   */
  enabled?: boolean
}

/**
 * ReleaseMetadata configuration.
 */
export type ConfigOptions = {
  /**
   * Git configuration. Defaults to `true`. If `false`, git information will
   * not be collected. Certain defaults can be overridden as a GitOptions
   * object.
   *
   * The command-line options `--no-git`, `--branch`, and `--remote` affect this
   * configfuration.
   */
  git?: boolean | GitOptions
  /**
   * Merge configuration. Use this to combine multiple existing release
   * metadata files together.
   *
   * The command-line options `--merge`, `--merge-original`, and
   * `--merge-overlay` affect this configuration.
   */
  merge?: MergeOptions
  /**
   * Only a "secure" version of the ReleaseMetadata should be generated.
   * Security filtering is applied after merging. If `true`, applies
   * a reasonable security configuration. In `application` mode, `secure`
   * defaults to `true`; in the command-line `secure` defaults to `false`.
   *
   * The command-line options `--secure`, `--secure-if-production`, and
   * `--omit-repo-url` affect this configuration.
   */
  secure?: boolean | SecurityOptions
  /**
   * The name of the package in the release metadata. If not provided, it will
   * be obtained via the git URL.
   *
   * Can be set from the command-line with `--release-name <name>`.
   */
  name?: string
  /**
   * The release timestamp to use. If not provided, will read
   * `process.env.TIMESTAMP` or generate one from `new Date()`.
   *
   * This can be set from the command-line with `--timestamp <timestamp>`.
   */
  timestamp?: string
  /**
   * The path to the release metadata file. In `application` mode, this will be
   * used for reading the metadata file. In the command-line, this will be used
   * as the default path for reading and writing metadata files.
   *
   * If this value is not provided, operations will be on
   * `${process.cwd()}/release-metadata.json`.
   *
   * When provided, the behaviour depends on whether the path is absolute or
   * relative and whether the resulting path is a file or directory. Relative
   * paths are prefixed with `process.cwd()`; directories are turned into files
   * by adding `release-metadata.json`.
   *
   * If the target path does not exist, it will be treated as a file to be read
   * and will be returned as determined above.
   *
   * | absolute | type  | file read                                        |
   * |----------|-------|--------------------------------------------------|
   * | yes      | dir   | `${path}/release-metadata.json`                  |
   * | no       | dir   | `${process.cwd()}/${path}/release-metadata.json` |
   * | yes      | file  | path                                             |
   * | no       | file  | `${process.cwd()}/${path}`                       |
   *
   * This can be set from the command-line with `--path <path>`.
   */
  path?: string
}

export type _Git = {
  branchTest: GitBranchTestFunction
  enabled: boolean
  remote: string | undefined
}

export type _Merge = {
  original: JSONObject
  overlay: JSONObject
}

export type _Security = {
  enabled: boolean
  env: { [key: string]: boolean } | false | undefined
  filter?: SecurityFilterFn | undefined
  omitRepoUrl: boolean | undefined
  requireFile: boolean | undefined
}

export type _Config = {
  git: _Git
  merge: _Merge
  name: string | undefined
  path: string
  secure: _Security
  timestamp: string
}

export type Mode = 'application' | 'command-line'

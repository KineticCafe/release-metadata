import deepmerge from 'deepmerge'
import { basename, extname } from 'path'

import * as json from './json-utils'
import { check } from './security'

import {
  JSONObject,
  JSONValue,
  PackageInfo,
  PartialPackageInfo,
  PartialReleaseMetadata,
  PartialRepoInfo,
  ProcessedMetadata,
  ReleaseMetadata,
  RepoInfo,
  SecureRepoInfo,
  _Config,
} from './types'

export const secured = (
  value: ReleaseMetadata,
  config: _Config
): ProcessedMetadata => {
  if (check('enabled', config)) {
    const securedMetadata = {
      name: value.name,
      timestamp: value.timestamp,
      repos: securedRepos(json.fetchArray(value, 'repos'), config),
    }

    return config.secure.filter
      ? config.secure.filter(securedMetadata, value)
      : securedMetadata
  }

  return value
}

export const merge = (
  metadata: ReleaseMetadata,
  options: _Config
): ReleaseMetadata => {
  const original = mergePartials(partial(options.merge.original), metadata)
  const overlay = mergePartials(original, partial(options.merge.overlay))

  return resolved(partial(overlay))
}

export const fromJSON = (
  metadata: JSONObject | ReleaseMetadata
): ReleaseMetadata => resolved(partial(metadata))

const mergePartials = (
  target: PartialReleaseMetadata,
  source: PartialReleaseMetadata
): PartialReleaseMetadata => {
  return {
    name: source.name ?? target.name,
    timestamp: source.timestamp ?? target.timestamp,
    source_path: source.source_path ?? target.source_path,
    repos: mergeList(target.repos, source.repos),
    packages: mergeList(target.packages, source.packages),
    ext: mergeExt(target.ext, source.ext),
  }
}

const partial = (value: JSONObject): PartialReleaseMetadata => {
  return {
    name: json.asString(value.name),
    timestamp: json.asString(value.timestamp),
    source_path: json.asString(value.source_path),
    repos: partialRepos(value.repos),
    packages: partialPackages(value.packages),
    ext: json.asObject(value.ext),
  }
}

const resolved = (value: PartialReleaseMetadata): ReleaseMetadata => {
  return {
    name: value.name,
    timestamp: json.fetchString(value, 'timestamp'),
    repos: resolvedRepos(json.fetchArray(value, 'repos')),
    source_path: json.fetchString(value, 'source_path'),
    packages: resolvedPackages(json.fetchArray(value, 'packages')),
    ext: value.ext,
  }
}

const partialRepos = (value: JSONValue): PartialRepoInfo[] | undefined => {
  if (json.isObject(value)) {
    return json.filter([partialRepo(value)])
  }

  if (json.isArray(value)) {
    return json.filter(value.map((v: JSONValue) => partialRepo(v)))
  }

  return undefined
}

const partialRepo = (value: JSONValue): PartialRepoInfo | undefined => {
  if (!json.isObject(value)) {
    return undefined
  }

  return {
    ref: json.asString(value.ref),
    url: json.asString(value.url),
    name: json.asString(value.name),
    type: json.asString(value.type),
    source_path: json.asString(value.source_path),
    ext: json.asObject(value.ext),
  }
}

const partialPackages = (
  value: JSONValue
): PartialPackageInfo[] | undefined => {
  if (json.isObject(value)) {
    return json.filter([partialPackage(value)])
  }

  if (json.isArray(value)) {
    return json.filter(value.map((v: JSONValue) => partialPackage(v)))
  }

  return undefined
}

const partialPackage = (value: JSONValue): PartialPackageInfo | undefined => {
  if (!json.isObject(value)) {
    return undefined
  }

  return {
    name: json.asString(value.name),
    versions: filterVersions(json.asObject(value.versions)),
    ext: json.asObject(value.ext),
  }
}

const filterVersions = (
  value: JSONObject | undefined
): { [key: string]: string } | undefined => {
  if (json.isUndefined(value)) {
    return undefined
  }

  const result: { [key: string]: string } = {}

  for (const k in value) {
    if (!json.isString(k)) {
      continue
    }

    const v: JSONValue = value[k]

    if (json.isString(v)) {
      result[k] = v
    } else if (json.isNumber(v)) {
      result[k] = v.toString()
    }
  }

  return result
}

const resolvedRepos = (value: JSONValue[] | PartialRepoInfo[]): RepoInfo[] =>
  json.filter(value.map((v: JSONValue | PartialRepoInfo) => resolvedRepo(v)))

const resolvedRepo = (
  value: JSONValue | PartialRepoInfo
): RepoInfo | undefined => {
  if (!json.isObject(value)) {
    return undefined
  }

  const url = json.isString(value.url) ? value.url : undefined
  const name = json.isString(value.name) ? value.name : undefined
  const ext = json.isObject(value.ext) ? value.ext : undefined

  return {
    ref: json.fetchString(value, 'ref'),
    url,
    name,
    type: json.fetchString(value, 'type'),
    source_path: json.fetchString(value, 'source_path'),
    ext,
  }
}

const resolvedPackages = (
  value: JSONValue[] | PartialPackageInfo[]
): PackageInfo[] =>
  json.filter(
    value.map((v: JSONValue | PartialPackageInfo) => resolvedPackage(v))
  )

const resolvedPackage = (
  value: JSONValue | PartialPackageInfo
): PackageInfo | undefined => {
  if (!json.isObject(value)) {
    return undefined
  }

  const ext = json.isObject(value.ext) ? value.ext : undefined
  const versions = filterVersions(json.fetchObject(value, 'versions')) ?? {}

  return {
    name: json.fetchString(value, 'name'),
    versions,
    ext,
  }
}

const securedRepos = (
  value: JSONValue[] | RepoInfo[],
  config: _Config
): SecureRepoInfo[] =>
  json.filter(value.map((v: JSONValue | RepoInfo) => securedRepo(v, config)))

const securedRepo = (
  value: JSONValue | RepoInfo,
  config: _Config
): SecureRepoInfo | undefined => {
  if (!json.isObject(value)) {
    return undefined
  }

  const result: SecureRepoInfo = {
    ref: json.fetchString(value, 'ref').replace(/^.*\((.+)\)/, '$1'),
  }

  if (!check('omitRepoUrl', config) && json.isString(value.url)) {
    result.url = basename(value.url, extname(value.url))
  }

  return result
}

const mergeList = <T>(
  target: T[] | undefined,
  source: T[] | undefined
): T[] | undefined => {
  if (Array.isArray(target)) {
    return Array.isArray(source) ? [...target, ...source] : target
  }

  return Array.isArray(source) ? source : undefined
}

const mergeExt = (
  target: JSONObject | undefined,
  source: JSONObject | undefined
): JSONObject | undefined => {
  if (json.isObject(target)) {
    return json.isObject(source) ? deepmerge(target, source) : target
  }

  return json.isObject(source) ? source : undefined
}

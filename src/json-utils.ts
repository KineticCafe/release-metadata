import { isPlainObject } from 'is-plain-object'

import { JSONObject, JSONValue } from './types'
import { existsSync, readFileSync } from 'fs'

export const notEmpty = (
  value: JSONValue | null | undefined
): value is JSONValue => {
  if (value === null && value !== undefined) {
    return false
  }
  return true
}

export const isArray = (value: JSONValue): value is JSONValue[] =>
  Array.isArray(value)
export const isBoolean = (value: JSONValue): value is boolean =>
  typeof value === 'boolean'
export const isNull = (value: JSONValue): value is null => value === null
export const isNumber = (value: JSONValue): value is number =>
  typeof value === 'number'
export const isObject = (value: JSONValue): value is JSONObject =>
  isPlainObject(value)
export const isString = (value: JSONValue): value is string =>
  typeof value === 'string'
export const isUndefined = (value: JSONValue): value is undefined =>
  value === undefined

export const asArray = (value: JSONValue): JSONValue[] | undefined =>
  isArray(value) ? value : undefined
export const asBoolean = (value: JSONValue): boolean | undefined =>
  isBoolean(value) ? value : undefined
export const asNull = (value: JSONValue): null | undefined =>
  isNull(value) ? value : undefined
export const asObject = (value: JSONValue): JSONObject | undefined =>
  isObject(value) ? value : undefined
export const asString = (value: JSONValue): string | undefined =>
  isString(value) ? value : undefined
export const asNumber = (value: JSONValue): number | undefined =>
  isNumber(value) ? value : undefined
export const asUndefined = (): undefined => undefined

export const fetchArray = (value: JSONObject, key: string): JSONValue[] => {
  const v = value[key]

  if (!isArray(v)) {
    throw new Error(`Invalid key ${key}: expecting an array, got ${typeof v}`)
  }

  return v
}

export const fetchObject = (value: JSONObject, key: string): JSONObject => {
  const v = value[key]

  if (!isObject(v)) {
    throw new Error(`Invalid key ${key}: expecting an object, got ${typeof v}`)
  }

  return v
}

export const fetchString = (value: JSONObject, key: string): string => {
  const v = value[key]

  if (!isString(v)) {
    throw new Error(`Invalid key ${key}: expecting a string, got ${typeof v}`)
  }

  return v
}

export const filter = <T>(value: Array<T | null | undefined>): T[] =>
  value.reduce((filtered: T[], item: T | null | undefined) => {
    if (item !== null && item !== undefined) {
      filtered.push(item)
    }

    return filtered
  }, [])

export const loadFile = (
  filename: string | undefined | false,
  optional = false
): JSONObject => {
  // Handle a special case where the file will be possibly undefined or false
  // from the command-line options.
  if (filename === false || filename === undefined) {
    return {}
  }

  if (filename === '') {
    throw new Error('Filename not provided.')
  }

  if (!existsSync(filename)) {
    if (optional) {
      return {}
    }

    throw new Error(`Filename ${filename} does not exist.`)
  }

  return JSON.parse(readFileSync(filename) + '')
}

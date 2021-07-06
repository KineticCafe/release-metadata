import { _Config, _Security } from './types'

type CheckTypes = 'enabled' | 'requireFile' | 'omitRepoUrl'

const env = process.env.NODE_ENV || 'development'

export const check = (check: CheckTypes, opts: _Config): boolean => {
  if (!isEnabled(opts.secure)) {
    return false
  }

  const { secure } = opts
  switch (check) {
    case 'enabled': {
      return true
    }
    case 'requireFile': {
      return requireFile(secure)
    }
    case 'omitRepoUrl': {
      return omitRepoUrl(secure)
    }
  }
}

const requireFile = (secure: _Security): boolean => Boolean(secure.requireFile)
const omitRepoUrl = (secure: _Security): boolean => Boolean(secure.omitRepoUrl)

const isEnabled = (secure: _Security): boolean =>
  secure.enabled
    ? typeof secure.env === 'object'
      ? secure.env[env]
      : true
    : false

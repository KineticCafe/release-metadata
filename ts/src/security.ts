import { ConfigInternal, SecurityInternal } from './types'

type CheckTypes = 'enabled' | 'requireFile' | 'omitRepoUrl'

const env = process.env.NODE_ENV || 'development'

export const check = (check: CheckTypes, opts: ConfigInternal): boolean => {
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

const requireFile = (secure: SecurityInternal): boolean => Boolean(secure.requireFile)

const omitRepoUrl = (secure: SecurityInternal): boolean => Boolean(secure.omitRepoUrl)

const isEnabled = (secure: SecurityInternal): boolean =>
  secure.enabled ? (typeof secure.env === 'object' ? secure.env[env] : true) : false

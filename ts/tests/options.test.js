const { processOptions } = require('../src/options.ts')

const testCommandLine = (options) => processOptions('command-line', options)
const testApplication = (options) => processOptions('application', options)

describe('processOptions/2', () => {
  test('fails if an invalid mode is provided', () => {
    expect(() => processOptions('foo')).toThrowError(
      `Invalid mode 'foo' provided`
    )
  })

  test('returns meaningful defaults for command-line mode', () => {
    expect(testCommandLine()).toMatchObject({
      git: {
        branchTest: expect.any(Function),
        enabled: true,
        remote: 'origin',
      },
      merge: {
        original: {},
        overlay: {},
      },
      name: undefined,
      path: expect.stringContaining('release-metadata.json'),
      secure: {
        enabled: false,
        env: false,
        filter: undefined,
        omitRepoUrl: undefined,
        requireFile: undefined,
      },
      timestamp: expect.stringMatching(/^\d{4}\d{2}\d{2}(\d{2}){3}/),
    })
  })

  test('returns meaningful defaults for testApplication mode', () => {
    expect(testApplication()).toMatchObject({
      git: {
        branchTest: expect.any(Function),
        enabled: true,
        remote: 'origin',
      },
      merge: {
        original: {},
        overlay: {},
      },
      name: undefined,
      path: expect.stringContaining('release-metadata.json'),
      secure: {
        enabled: true,
        env: {
          production: true,
        },
        filter: undefined,
        omitRepoUrl: false,
        requireFile: true,
      },
      timestamp: expect.stringMatching(/^\d{4}\d{2}\d{2}(\d{2}){3}/),
    })
  })

  test('resolves to the provided name', () => {
    expect(testCommandLine({ name: 'foo' })).toMatchObject({
      name: 'foo',
    })
  })

  describe('git options', () => {
    test('returns no git information if disabled', () => {
      expect(testCommandLine({ git: false })).toMatchObject({
        git: {
          branchTest: expect.any(Function),
          enabled: false,
          remote: undefined,
        },
      })
    })

    test('returns the same defaults for null, undefined, and true', () => {
      const expected = {
        git: {
          branchTest: expect.any(Function),
          enabled: true,
          remote: 'origin',
        },
      }

      expect(testCommandLine()).toMatchObject(expected)
      expect(testCommandLine({ git: null })).toMatchObject(expected)
      expect(testCommandLine({ git: undefined })).toMatchObject(expected)
      expect(testCommandLine({ git: true })).toMatchObject(expected)
    })

    describe('uses a provided object', () => {
      test('returns a default branch test function if not present', () => {
        const result = testCommandLine({ git: {} })
        expect(result).toMatchObject({
          git: { branchTest: expect.any(Function) },
        })

        expect(result.git.branchTest('main')).toBe(true)
        expect(result.git.branchTest('master')).toBe(true)
        expect(result.git.branchTest('hoge')).toBe(false)
      })

      test('returns a default specific branch function if provided git.branch', () => {
        const result = testCommandLine({ git: { branch: 'hoge' } })
        expect(result).toMatchObject({
          git: { branchTest: expect.any(Function) },
        })

        expect(result.git.branchTest('main')).toBe(false)
        expect(result.git.branchTest('master')).toBe(false)
        expect(result.git.branchTest('hoge')).toBe(true)
      })

      test('returns a custom function if provided', () => {
        const result = testCommandLine({
          git: { branchTest: (m) => m.length > 3 },
        })
        expect(result).toMatchObject({
          git: { branchTest: expect.any(Function) },
        })

        expect(result.git.branchTest('q')).toBe(false)
        expect(result.git.branchTest('qqqq')).toBe(true)
      })

      test('has its own enabled flag', () => {
        expect(testCommandLine({ git: { enabled: false } })).toMatchObject({
          git: { enabled: false },
        })
      })

      test('accepts the spdcified name of the remote', () => {
        expect(
          testCommandLine({ git: { remote: 'kineticcafe' } })
        ).toMatchObject({
          git: { remote: 'kineticcafe' },
        })
      })
    })
  })

  describe('secure options', () => {
    describe('has a low-security mode', () => {
      const expected = {
        secure: {
          enabled: false,
          env: false,
          filter: undefined,
          omitRepoUrl: undefined,
          requireFile: undefined,
        },
      }

      test('used in command-line mode and no security options are passed', () => {
        expect(testCommandLine()).toMatchObject(expected)
      })

      test('used when { secure: false }', () => {
        expect(testApplication({ secure: false })).toMatchObject(expected)
      })
    })

    describe('has a higher security mode', () => {
      const expected = {
        secure: {
          enabled: true,
          env: { production: true },
          filter: undefined,
          omitRepoUrl: false,
          requireFile: true,
        },
      }

      test('used in testApplication mode', () => {
        expect(testApplication()).toMatchObject(expected)
      })

      test('used when { secure: true }', () => {
        expected.secure = {
          ...expected.secure,
          env: false,
          requireFile: false,
        }

        expect(testCommandLine({ secure: true })).toMatchObject(expected)
      })
    })

    describe('can parse a provided security object', () => {
      describe('respects secure.enabled', () => {
        test('when true', () => {
          expect(testApplication({ secure: { enabled: true } })).toMatchObject({
            secure: { enabled: true },
          })
        })
        test('when false', () => {
          expect(testApplication({ secure: { enabled: false } })).toMatchObject(
            {
              secure: { enabled: false },
            }
          )
        })
        test('when omitted', () => {
          expect(testApplication({ secure: {} })).toMatchObject({
            secure: { enabled: true },
          })
        })
      })

      describe('respects secure.env', () => {
        test('when true', () => {
          expect(testApplication({ secure: { env: true } })).toMatchObject({
            secure: { env: { production: true } },
          })
        })
        test('when false', () => {
          expect(testApplication({ secure: { env: false } })).toMatchObject({
            secure: { env: false },
          })
        })
        test('when omitted', () => {
          expect(testApplication({ secure: {} })).toMatchObject({
            secure: { env: false },
          })
        })
        test('when a string', () => {
          expect(testApplication({ secure: { env: 'staging' } })).toMatchObject(
            {
              secure: { env: { staging: true } },
            }
          )
        })
        test('when a map of environments', () => {
          expect(
            testApplication({
              secure: {
                env: { production: true, development: false, staging: true },
              },
            })
          ).toMatchObject({
            secure: {
              env: { production: true, development: false, staging: true },
            },
          })
        })
      })

      describe('respects secure.filter', () => {
        test('when a function', () => {
          expect(
            testApplication({ secure: { filter: () => false } })
          ).toMatchObject({
            secure: { filter: expect.any(Function) },
          })
        })
        test('when not a function', () => {
          expect(testApplication({ secure: { filter: false } })).toMatchObject({
            secure: { filter: undefined },
          })
        })
      })

      describe('respects secure.omitRepoUrl', () => {
        test('when true', () => {
          expect(
            testApplication({ secure: { omitRepoUrl: true } })
          ).toMatchObject({
            secure: { omitRepoUrl: true },
          })
        })
        test('when false', () => {
          expect(
            testApplication({ secure: { omitRepoUrl: false } })
          ).toMatchObject({
            secure: { omitRepoUrl: false },
          })
        })
        test('when omitted', () => {
          expect(testApplication({ secure: {} })).toMatchObject({
            secure: { omitRepoUrl: false },
          })
        })
      })

      describe('respects secure.requireFile', () => {
        test('when true', () => {
          expect(
            testApplication({ secure: { requireFile: true } })
          ).toMatchObject({
            secure: { requireFile: true },
          })
        })
        test('when false', () => {
          expect(
            testApplication({ secure: { requireFile: false } })
          ).toMatchObject({
            secure: { requireFile: false },
          })
        })
        test('when omitted and in application mode is true', () => {
          expect(testApplication({ secure: {} })).toMatchObject({
            secure: { requireFile: true },
          })
        })
        test('when omitted and in application mode is false', () => {
          expect(testCommandLine({ secure: {} })).toMatchObject({
            secure: { requireFile: false },
          })
        })
      })
    })

    test('will configure for full output in command-line or when secure is false', () => {
      const expected = {
        secure: {
          enabled: false,
          env: false,
          filter: undefined,
          omitRepoUrl: undefined,
          requireFile: undefined,
        },
      }

      expect(testCommandLine()).toMatchObject(expected)
      expect(testApplication({ secure: false })).toMatchObject(expected)
    })
  })

  describe('timestamp', () => {
    const env = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...env }
    })

    afterEach(() => {
      process.env = env
    })

    test('uses the provided value as timestamp', () => {
      expect(testCommandLine({ timestamp: 'timestamp' })).toMatchObject({
        timestamp: 'timestamp',
      })
    })

    test('uses $RELEASE_TIMESTAMP if set', () => {
      process.env.RELEASE_TIMESTAMP = 'release-timestamp'
      expect(testCommandLine()).toMatchObject({
        timestamp: 'release-timestamp',
      })
    })

    test('creates a new timestamp', () => {
      expect(testCommandLine()).toMatchObject({
        timestamp: expect.stringMatching(/^\d{4}\d{2}\d{2}(\d{2}){3}/),
      })
    })
  })

  describe('path', () => {
    const expectedPath = '/some/absolute/path'
    const process = require('process')
    const fs = require('fs')
    jest.spyOn(process, 'cwd').mockReturnValue(expectedPath)

    test('returns $PWD/release-metadata.json by default', () => {
      expect(testCommandLine()).toMatchObject({
        path: '/some/absolute/path/release-metadata.json',
      })
    })

    describe('when provided a relative path, appends it to $PWD', () => {
      test('and appends release-metadata.json if a directory', () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(true)
        jest.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true })

        expect(
          testCommandLine({
            path: 'relative',
          })
        ).toMatchObject({
          path: '/some/absolute/path/relative/release-metadata.json',
        })
      })

      test('and uses the value as a file if not a directory', () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(true)
        jest.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => false })

        expect(testCommandLine({ path: 'relative.json' })).toMatchObject({
          path: '/some/absolute/path/relative.json',
        })
      })

      test('and uses the value as a file if it does not exist', () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(false)

        expect(testCommandLine({ path: 'relative.json' })).toMatchObject({
          path: '/some/absolute/path/relative.json',
        })
      })
    })
  })
})

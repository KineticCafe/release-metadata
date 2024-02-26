const { check } = require('../src/security')

describe('check/2', () => {
  describe('check enabled', () => {
    test('returns false when secure is disabled', () => {
      expect(check('enabled', { secure: { enabled: false } })).toBe(false)
    })

    test('returns true when enabled', () => {
      expect(check('enabled', { secure: { enabled: true } })).toBe(true)
    })

    describe('when using environment support', () => {
      test('returns true when enabled in a supported environment', () => {
        expect(
          check('enabled', {
            secure: { enabled: true, env: { test: true } },
          }),
        ).toBe(true)
      })

      test('returns false when enabled in an unsupported environment', () => {
        expect(
          check('enabled', {
            secure: { enabled: true, env: { production: true } },
          }),
        ).toBe(false)
      })
    })
  })

  describe('check requireFile', () => {
    test('returns false when secure is disabled', () => {
      expect(check('requireFile', { secure: { enabled: false } })).toBe(false)
    })

    test('returns false when requireFile is omitted', () => {
      expect(check('requireFile', { secure: { enabled: true } })).toBe(false)
    })

    test('returns true when enabled', () => {
      expect(check('requireFile', { secure: { enabled: true, requireFile: true } })).toBe(
        true,
      )
    })

    describe('when using environment support', () => {
      test('returns true when enabled in a supported environment', () => {
        expect(
          check('requireFile', {
            secure: { enabled: true, env: { test: true }, requireFile: true },
          }),
        ).toBe(true)
      })

      test('returns false when enabled in an unsupported environment', () => {
        expect(
          check('requireFile', {
            secure: { enabled: true, env: { production: true } },
          }),
        ).toBe(false)
      })
    })
  })

  describe('check omitRepoUrl', () => {
    test('returns false when secure is disabled', () => {
      expect(check('omitRepoUrl', { secure: { enabled: false } })).toBe(false)
    })

    test('returns false when omitRepoUrl is omitted', () => {
      expect(check('omitRepoUrl', { secure: { enabled: true } })).toBe(false)
    })

    test('returns true when enabled', () => {
      expect(check('omitRepoUrl', { secure: { enabled: true, omitRepoUrl: true } })).toBe(
        true,
      )
    })

    describe('when using environment support', () => {
      test('returns true when enabled in a supported environment', () => {
        expect(
          check('omitRepoUrl', {
            secure: { enabled: true, env: { test: true }, omitRepoUrl: true },
          }),
        ).toBe(true)
      })

      test('returns false when enabled in an unsupported environment', () => {
        expect(
          check('omitRepoUrl', {
            secure: { enabled: true, env: { production: true } },
          }),
        ).toBe(false)
      })
    })
  })
})

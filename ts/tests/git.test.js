const { git } = require('../src/git')

const { failCommand, gitCommands, mockGit } = require('./support/git')

describe('git/1', () => {
  test('returns undefined if git is disabled', () => {
    expect(git({ enabled: false })).toBe(undefined)
  })

  describe('obtains its values from the git executable', () => {
    beforeEach(() => mockGit())

    test('sets the name and URL correctly', () => {
      expect(git({})).toMatchObject({
        name: 'test-repo',
        url: 'https://host/owner/test-repo.git',
      })
    })

    test('sets the name and URL correctly for a custom remote', () => {
      expect(git({ remote: 'upstream' })).toMatchObject({
        name: 'test-repo',
        url: 'https://host/owner/test-repo.git',
      })
    })

    test('sets the name and URL to UNKNOWN with major errors', () => {
      expect(git({ remote: 'exception' })).toMatchObject({
        name: 'UNKNOWN',
        url: 'UNKNOWN',
      })
    })

    test('sets the name and URL to UNKNOWN with an invalid remote', () => {
      expect(git({ remote: 'invalid' })).toMatchObject({
        name: 'UNKNOWN',
        url: 'UNKNOWN',
      })
    })

    test('parses the remote URL differently with an old version of git', () => {
      expect(git({ remote: 'old-version' })).toMatchObject({
        name: 'test-repo',
        url: 'https://host/owner/test-repo.git',
      })
    })

    test('returns a bare hashref when on the main branch', () => {
      expect(git({})).toMatchObject({
        ref: '2879128793bd9cf1c8a98a02cb3e671bbea16800',
      })
    })

    test('returns a branch name and hashref when not on the main branch', () => {
      expect(git({ branchTest: () => false })).toMatchObject({
        ref: 'release (2879128793bd9cf1c8a98a02cb3e671bbea16800)',
      })
    })

    test('returns a hashref when on the main branch', () => {
      expect(git({ branchTest: () => true })).toMatchObject({
        ref: '2879128793bd9cf1c8a98a02cb3e671bbea16800',
      })
    })

    test('mock', () => {
      mockGit()

      let result

      expect(() => {
        result = git({ enabled: true })
      }).not.toThrowError()

      expect(result).toStrictEqual({
        name: 'test-repo',
        ref: '2879128793bd9cf1c8a98a02cb3e671bbea16800',
        source_path: '/path/to/test-repo',
        type: 'git',
        url: 'https://host/owner/test-repo.git',
      })
    })
  })

  describe('special cases', () => {
    test('returns just the hash ref is there are errors getting the branch', () => {
      mockGit({
        ...gitCommands,
        'git symbolic-ref --quiet --short HEAD': failCommand,
      })

      expect(git({})).toMatchObject({
        ref: '2879128793bd9cf1c8a98a02cb3e671bbea16800',
      })
    })

    test('returns an UNKNOWN ref is there are errors getting ref', () => {
      mockGit({
        ...gitCommands,
        'git rev-parse HEAD': failCommand,
      })

      expect(git({})).toMatchObject({
        ref: 'UNKNOWN',
      })
    })
  })
})

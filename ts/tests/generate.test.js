// @typescript-eslint
const { resolve } = require('../src/generate')
const { mockGit } = require('./support/git')
const process = require('process')

// resting resolve _also_ tests build/2 and postProcess/2.
describe('resolve/2', () => {
  const expectedPath = '/path/to/test-repo'
  jest.spyOn(process, 'cwd').mockReturnValue(expectedPath)

  test('throws an exception if secure in application mode', () => {
    expect(() => resolve('application', { secure: { requireFile: true } })).toThrowError(
      'Release Metadata generation is not allowed in secure mode',
    )
  })

  test('builds a full structure if command-line mode', () => {
    mockGit()
    expect(resolve('command-line')).toMatchObject({
      ext: undefined,
      name: 'test-repo',
      packages: [
        {
          ext: undefined,
          name: 'node',
          versions: expect.any(Object),
        },
      ],
      repos: [
        {
          ext: undefined,
          name: 'test-repo',
          ref: 'release (2879128793bd9cf1c8a98a02cb3e671bbea16800)',
          source_path: expectedPath,
          type: 'git',
          url: 'https://host/owner/test-repo.git',
        },
      ],
      source_path: expectedPath,
      timestamp: expect.stringMatching(/^\d{4}\d{2}\d{2}(\d{2}){3}/),
    })
  })
})

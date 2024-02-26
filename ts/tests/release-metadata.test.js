const { create, createStatic, generate } = require('../src/index')
const { mockGit } = require('./support/git')
const process = require('process')
const fs = require('fs')

describe('generate', () => {
  const expectedPath = '/path/to/test-repo'
  jest.spyOn(process, 'cwd').mockReturnValue(expectedPath)

  test('builds a full structure if command-line mode', () => {
    mockGit()
    expect(generate()).toMatchObject({
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

describe('createStatic', () => {
  const expectedPath = '/path/to/test-repo'
  jest.spyOn(process, 'cwd').mockReturnValue(expectedPath)

  test('throws an exception if secure in application mode and the file does not exist', () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false)
    expect(() => createStatic({ secure: { requireFile: true } })).toThrowError(
      'secure.requireFile is enabled, but /path/to/test-repo/release-metadata.json does not exist',
    )
  })

  test('loads from JSON if secure', () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true })
    jest.spyOn(fs, 'readFileSync').mockReturnValue(
      JSON.stringify({
        name: 'test-repo',
        packages: [],
        repos: [
          {
            name: 'test-repo',
            ref: 'release (2879128793bd9cf1c8a98a02cb3e671bbea16800)',
            source_path: expectedPath,
            type: 'git',
            url: 'https://host/owner/test-repo.git',
          },
        ],
        source_path: expectedPath,
        timestamp: '19990526134532',
      }),
    )

    expect(createStatic({ secure: { requireFile: true } })).toMatchObject({
      name: 'test-repo',
      repos: [
        {
          ref: '2879128793bd9cf1c8a98a02cb3e671bbea16800',
          url: 'test-repo',
        },
      ],
      timestamp: expect.stringMatching(/^\d{4}\d{2}\d{2}(\d{2}){3}/),
    })
  })

  test('builds a full structure', () => {
    mockGit()
    expect(generate()).toMatchObject({
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

describe('create', () => {
  const expectedPath = '/path/to/test-repo'
  jest.spyOn(process, 'cwd').mockReturnValue(expectedPath)

  test('returns a function', () => {
    expect(create({ secure: { requireFile: true } })).toBeInstanceOf(Function)
  })

  test('throws an exception if secure in application mode and the file does not exist', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false)
    await expect(
      async () => await create({ secure: { requireFile: true } })(),
    ).rejects.toThrowError(
      'secure.requireFile is enabled, but /path/to/test-repo/release-metadata.json does not exist',
    )
  })

  test('loads from JSON if secure', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true })
    jest.spyOn(fs, 'readFileSync').mockReturnValue(
      JSON.stringify({
        name: 'test-repo',
        packages: [],
        repos: [
          {
            name: 'test-repo',
            ref: 'release (2879128793bd9cf1c8a98a02cb3e671bbea16800)',
            source_path: expectedPath,
            type: 'git',
            url: 'https://host/owner/test-repo.git',
          },
        ],
        source_path: expectedPath,
        timestamp: '19990526134532',
      }),
    )

    const fn = create({ secure: { requireFile: true } })
    expect(await fn()).toMatchObject({
      name: 'test-repo',
      repos: [
        {
          ref: '2879128793bd9cf1c8a98a02cb3e671bbea16800',
          url: 'test-repo',
        },
      ],
      timestamp: expect.stringMatching(/^\d{4}\d{2}\d{2}(\d{2}){3}/),
    })
  })

  test('builds a full structure', async () => {
    mockGit()
    const fn = create()
    expect(await fn()).toMatchObject({
      ext: undefined,
      name: 'test-repo',
      packages: [],
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

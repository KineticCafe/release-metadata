const { secured, merge, fromJSON } = require('../src/transform')

const repoData = {
  ref: '2879128793bd9cf1c8a98a02cb3e671bbea16800',
  url: 'https://host/owner/test-repo.git',
  name: 'test-repo',
  type: 'git',
  source_path: '/path/to/test-repo',
}

const rawMetadata = {
  name: 'test-repo',
  timestamp: '20210910191245',
  repos: [repoData],
  source_path: '/path/to/test-repo',
  packages: [
    {
      name: 'node',
      versions: {
        node: '16.14.0',
        v8: '9.4.146.24-node.20',
        uv: '1.43.0',
        zlib: '1.2.11',
        brotli: '1.0.9',
        ares: '1.18.1',
        modules: '93',
        nghttp2: '1.45.1',
        napi: '8',
        llhttp: '6.0.4',
        openssl: '1.1.1m+quic',
        cldr: '40.0',
        icu: '70.1',
        tz: '2021a3',
        unicode: '14.0',
        ngtcp2: '0.1.0-DEV',
        nghttp3: '0.1.0-DEV',
      },
    },
  ],
}

describe('secured/2', () => {
  describe('secures the output when enabled', () => {
    test('omits root-level source_path', () => {
      expect(
        secured(rawMetadata, { secure: { enabled: true } })
      ).not.toHaveProperty('source_path')
    })

    test('omits root-level packages', () => {
      expect(
        secured(rawMetadata, { secure: { enabled: true } })
      ).not.toHaveProperty('packages')
    })

    test('cleans up the ref value to omit branch names', () => {
      const cooked = secured(
        {
          ...rawMetadata,
          repos: [{ ...repoData, ref: `branch (${repoData.ref})` }],
        },
        { secure: { enabled: true } }
      )

      expect(cooked).toHaveProperty('repos[0].ref', repoData.ref)
    })

    test('omits the repo URL when configured', () => {
      const cooked = secured(rawMetadata, {
        secure: { enabled: true, omitRepoUrl: true },
      })

      expect(cooked).not.toHaveProperty('repos[0].url')
    })

    test('cleans the repo URL when not omitted', () => {
      const cooked = secured(rawMetadata, { secure: { enabled: true } })

      expect(cooked).toHaveProperty('repos[0].url', 'test-repo')
    })
  })

  test('makes no changes when unsecured', () => {
    expect(secured(rawMetadata, { secure: { enabled: false } })).toStrictEqual(
      rawMetadata
    )
  })
})

describe('merge/2', () => {
  test('supports original values', () => {
    expect(
      merge(
        {
          ...rawMetadata,
          ext: {
            extension: 1,
          },
        },
        {
          merge: {
            original: {
              repos: [
                {
                  ...repoData,
                  ref: '"00861aebb176e3bc20a89a8c1fc9db3978219782"',
                },
              ],
              ext: {
                extension: 3,
                original: 2,
              },
            },
            overlay: {},
          },
        }
      )
    ).toStrictEqual({
      ...rawMetadata,
      ext: {
        extension: 1,
        original: 2,
      },
      packages: [{ ...rawMetadata.packages[0], ext: undefined }],
      repos: [
        {
          ...repoData,
          ref: '"00861aebb176e3bc20a89a8c1fc9db3978219782"',
          ext: undefined,
        },
        { ...repoData, ext: undefined },
      ],
    })
  })

  test('supports overlay values', () => {
    expect(
      merge(
        { ...rawMetadata, packages: [3] },
        {
          merge: {
            original: {},
            overlay: { name: 'unified-repo' },
          },
        }
      )
    ).toStrictEqual({
      ...rawMetadata,
      name: 'unified-repo',
      ext: undefined,
      packages: [],
      repos: [{ ...repoData, ext: undefined }],
    })
  })
})

describe('fromJSON/1', () => {
  test('requires a minimum configuration', () => {
    expect(
      fromJSON({
        name: 'name',
        timestamp: 'timestamp',
        repos: [3],
        source_path: 'source_path',
        packages: [],
      })
    ).toStrictEqual({
      name: 'name',
      timestamp: 'timestamp',
      repos: [],
      source_path: 'source_path',
      packages: [],
      ext: undefined,
    })
  })

  test('can transform a repos object', () => {
    expect(
      fromJSON({
        name: 'name',
        timestamp: 'timestamp',
        repos: {
          ref: 'decafbad',
          type: 'git',
          source_path: 'repo_source_path',
        },
        source_path: 'source_path',
        packages: [],
      })
    ).toStrictEqual({
      name: 'name',
      timestamp: 'timestamp',
      repos: [
        {
          ext: undefined,
          name: undefined,
          ref: 'decafbad',
          source_path: 'repo_source_path',
          type: 'git',
          url: undefined,
        },
      ],
      source_path: 'source_path',
      packages: [],
      ext: undefined,
    })
  })

  test('can transform a repos array', () => {
    expect(
      fromJSON({
        name: 'name',
        timestamp: 'timestamp',
        repos: [
          {
            ref: 'decafbad',
            type: 'git',
            source_path: 'repo_source_path',
          },
          3,
        ],
        source_path: 'source_path',
        packages: [],
      })
    ).toStrictEqual({
      name: 'name',
      timestamp: 'timestamp',
      repos: [
        {
          ext: undefined,
          name: undefined,
          ref: 'decafbad',
          source_path: 'repo_source_path',
          type: 'git',
          url: undefined,
        },
      ],
      source_path: 'source_path',
      packages: [],
      ext: undefined,
    })
  })

  test('can transform a packages object', () => {
    expect(
      fromJSON({
        name: 'name',
        timestamp: 'timestamp',
        repos: [],
        source_path: 'source_path',
        packages: {
          versions: {
            node: '1.2.3.4',
            arm: 5,
          },
          name: 'node',
        },
      })
    ).toStrictEqual({
      name: 'name',
      timestamp: 'timestamp',
      repos: [],
      source_path: 'source_path',
      packages: [
        {
          ext: undefined,
          versions: {
            node: '1.2.3.4',
            arm: '5',
          },
          name: 'node',
        },
      ],
      ext: undefined,
    })
  })

  test('can transform a packages array', () => {
    expect(
      fromJSON({
        name: 'name',
        timestamp: 'timestamp',
        repos: [],
        source_path: 'source_path',
        packages: [
          {
            ext: undefined,
            versions: {},
            name: 'node',
          },
          'invalid',
        ],
      })
    ).toStrictEqual({
      name: 'name',
      timestamp: 'timestamp',
      repos: [],
      source_path: 'source_path',
      packages: [
        {
          ext: undefined,
          versions: {},
          name: 'node',
        },
      ],
      ext: undefined,
    })
  })
})

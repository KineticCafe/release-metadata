import { resolve } from '../generate'

describe('resolve/2', () => {
  it('throws an exception if secure in application mode', async () => {
    await expect(
      async () =>
        await resolve('application', { secure: { requireFile: true } })
    ).rejects.toThrowError(
      'Release Metadata generation is not allowed in secure mode'
    )
  })
})

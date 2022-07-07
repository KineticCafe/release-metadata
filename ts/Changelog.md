# Changelog

## 2.0.0 / 2022-06-16

- Updated dependencies. The minimum supported version is Node 12. This forces
  a bump to version 2.

- Renamed a bunch of internal structures to improve code clarity.

- Added _lots_ of unit tests and put coverage controls in place.

- Added some flexibility on `secure.env` so that a single string can be
  provided and it will be presented as a configuration object. This way,
  a configuration of `{ secure: { env: 'test' } }` would be interpreted as
  `{ secure: { env: { test: true } } }`.

- Simplified some of the code through tests. There are some uncovered lines
  which may represent unlikely or impossible cases, but it's unclear the best
  way to test them to see if they may be removed.

## 1.1.1 / 2021-07-28

- Fixed `--merge` behaviour to no longer require that the original file exists
  _if_ a filename has not been provided.

- Updated the changelog in retrospect for 1.1.0.

## 1.1.0 / 2021-07-28

- Changed all of the `git` functions to no longer use a promisified
  version of `exec`, but instead use `execSync`. The output is the same,
  but this allows for the addition of a new function, `createStatic`.
  This function allows for use of the release metadata data without
  needing to `await` or handle in promise chains, such as when using the
  output to initialize the `release` value of Sentry.

- Fix things not found in lint for 1.1.0

## 1.0.0 / 2021-07-08

- Initial release. This is the initial release of release-metadata for use with
  Node applications. This is based originally on work done at Kinetic Cafe and
  released as part of the Cartage gem and later ported to Elixir (not yet
  open-sourced). We use this information as part of our live endpoint test and
  lets us know which version of the application has been deployed.

  When writing this version, there are several changes to the original release
  metadata format. There are built-in secure representations of the release
  metadata format and sub-formats, and a built-in extensible version.

  Tests are currently minimal because there's a lot of data that would need to
  be mocked in order to meaningfully test.

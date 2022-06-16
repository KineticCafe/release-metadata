# release-metadata

Generates and provides release metadata for the current application.

```json
{
  "name": "release-metadata",
  "timestamp": "20210706195814",
  "repos": [
    {
      "ref": "b7ebeb23c2dfbd9bba637a91cccfaa2fe0860108",
      "url": "https://github.com/KineticCafe/release-metadata-ts.git",
      "name": "release-metadata-ts",
      "type": "git",
      "source_path": "/home/halostatue/projects/kineticcafe/release-metadata/release-metadata-ts"
    }
  ],
  "source_path": "/home/halostatue/projects/kineticcafe/release-metadata/release-metadata-ts",
  "packages": [
    {
      "name": "node",
      "versions": {
        "node": "16.4.0",
        "v8": "9.1.269.36-node.14",
        "uv": "1.41.0",
        "zlib": "1.2.11",
        "brotli": "1.0.9",
        "ares": "1.17.1",
        "modules": "93",
        "nghttp2": "1.43.0",
        "napi": "8",
        "llhttp": "6.0.2",
        "openssl": "1.1.1k",
        "cldr": "39.0",
        "icu": "69.1",
        "tz": "2021a",
        "unicode": "13.0"
      }
    }
  ]
}
```

## Usage

There are two use cases for `ReleaseMetadata`:

- generating a release metadata file for inclusion in a release package;
- presenting a release metadata collection output through an API.

### Generating Metadata

Release metadata can be generated for the current application repository with
`npm exec release-metadata --save`. There are numerous options available for the
`release-metadata` command-line:

- `--path <PATH>`: The path and/or filename for the metadata (implies --save)
- `--save`: Writes release-metadata.json to the current directory
- `--no-save`: Prints to standard output instead of saving, used with --path for
  reading only
- `--merge [ORIGINAL]`: Merges the generated release metadata with an existing
  file. If just `--merge` is provided, the original file does not need to exist;
  if `--merge ORIGINAL` is provided, the original file must exist. Incompatible
  with `--merge-original`.
- `--merge-original <ORIGINAL>`: Merges the generated release metadata with the
  original file (the generated data overrides the original data)
- `--merge-overlay <OVERLAY>`: Merges the overlay file with the generated
  release metadata (the overlay overrides the generated data)
- `--branch <BRANCH>`: The default git branch to use, if not main or master
- `--remote <REMOTE>`: The default git remote to use, if not origin
- `--no-git`: Disables git processing
- `--secure`: Resolves only to a secure version of the output
- `--secure-if-production`: Resolves to a secure version if `NODE_ENV` is
  production
- `--omit-repo-url`: Eliminates the repo URL
- `--release-name <NAME>`: The value to use as the release name
- `--timestamp <TIMESTAMP>`: The timestamp to use

Both `--merge-original` and `--merge-overlay` may be used at the same time. See
{@link ConfigOptions} for more information.

This metadata file can be manipulated by other tools to include more
information, if desired, such as the current version of Node.js, or it can
merge an existing metadata file when `--merge` is provided.

The timestamp value can be overridden by setting `RELEASE_TIMESTAMP` in
OS environment variables.

#### Programmatic Generation

It is possible to write your own script to generate the release metadata so that
it can become part of a build or packaging script. The script will look
something like this:

```javascript
import { generate } from '@kineticcafe/release-metadata'

const config = {
  // Set configuration options here. See ConfigOptions documentation for
  // details.
  path: 'release.json',
  name: 'my-package',
}

generate(config).then((processed) => {
  // Do something with the processed metadata.
})
```

### Presenting Metadata

Use the `create` function to read and process the release metadata for
presentation from an API.

```javascript
// ./release-metadata.mjs
import { create } from '@kineticcafe/release-metadata'

export const releaseMetadata = create()
```

The output of `create()` is an async function that returns a release metadata
map that could be used in an `express` handler, for example:

```javascript
import { releaseMetadata } from './release-metadata.mjs'

express.get('/release', async (_req, res, _next) => {
  res.send(await releaseMetadata())
})
```

#### Static Presentation

Use the `createStatic` function to read and process the release metadata and
return a static release metadata map.

```javascript
// ./release-metadata.mjs
import { createStatic } from '@kineticcafe/release-metadata'

export const releaseMetadata = createStatic({ secure: true })

// app.mjs
import { releaseMetadata } from './release-metadata.mjs'

express.get('/release', (_req, res, _next) => {
  res.send(releaseMetadata)
})
```

## Installation

```sh
# Pick your poison:
npm install @kineticcafe/release-metadata
yarn install @kineticcafe/release-metadata
pnpm install @kineticcafe/release-metadata
```

If the only purpose is the generation of a release metadata file from the
command-line, release-metadata may be installed as a development dependency:

```sh
npm install -D @kineticcafe/release-metadata
yarn install -D @kineticcafe/release-metadata
pnpm install -D @kineticcafe/release-metadata
```

## License

Licensed under the MIT license.

## Community and Contributing

We welcome your contributions, as described in [Contributing.md]. Like all
Kinetic Cafe [open source projects], is under the Kinetic Cafe Open Source
[Code of Conduct][kccoc].

[contributing.md]: Contributing.md
[open source projects]: https://github.com/KineticCafe
[kccoc]: https://github.com/KineticCafe/code-of-conduct

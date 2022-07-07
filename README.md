# release-metadata

Generates and provides release metadata for the current application.
Implementations are provided for TypeScript, Elixir, and Ruby. See the README
files for each implementation for more details.

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

## Licence

Licensed under the MIT licence.

## Community and Contributing

We welcome your contributions, as described in [Contributing.md][]. Like all
Kinetic Cafe [open source projects][], is under the Kinetic Cafe Open Source
[Code of Conduct][kccoc].

[contributing.md]: Contributing.md
[open source projects]: https://github.com/KineticCafe
[kccoc]: https://github.com/KineticCafe/code-of-conduct

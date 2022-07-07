## Contributing

We value any contribution to release-metadata you can provide: a bug report,
a feature request, or code contributions. Here are our guidelines for
contributions:

- Changes _will not_ be accepted without tests.
- Match our coding style for the implementation(s) you’re updating.
  - Our Ruby code uses Standard Ruby.
  - Our TypeScript code uses ESLint and Prettier.
  - Our Elixir code uses `mix format` and Credo.
- Use a thoughtfully named topic branch that contains your change. Rebase
  your commits into logical chunks as necessary.
- Use [quality commit messages][].
- Do not change the version number; when your patch is accepted and a release
  is made, the version will be updated at that point.
- Submit a GitHub pull request with your changes.

### Workflow

Here's the most direct way to get your work merged into the project:

- Fork the project.
- Clone down your fork (`git clone git://github.com/<username>/release-metadata.git`).
- Create a topic branch to contain your change (`git checkout -b my_awesome_feature`).
- Hack away, add tests. Not necessarily in that order.
- Ensure that all tests still pass.
- Ensure that there are no code formatting changes that need to be applied and
  that there are no warnings or errors put out during the build or test
  processes.
- Push the branch up (`git push origin my_awesome_feature`).
- Create a pull request against KineticCafe/release-metadata does and the
  why you think it should be merged.

### Contributors

- Austin Ziegler created release-metadata based on work previously done with
  the cartage gems.

[quality commit messages]: https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html

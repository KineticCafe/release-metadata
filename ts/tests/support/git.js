const child_process = require('child_process')
const { execSync } = child_process

const failCommand = () => {
  throw new Error('Command failed')
}

const gitCommands = {
  'git remote get-url invalid': failCommand,
  'git remote show -n invalid': '',
  'git remote get-url exception': failCommand,
  'git remote show -n exception': failCommand,
  'git remote get-url old-version': failCommand,
  'git remote show -n old-version':
    '* remote old-version\n  Fetch URL: https://host/owner/test-repo.git\n',
  'git remote get-url origin': 'https://host/owner/test-repo.git',
  'git remote get-url upstream': 'https://host/owner/test-repo.git',
  'git rev-parse --show-toplevel': '/path/to/test-repo',
  'git rev-parse HEAD': '2879128793bd9cf1c8a98a02cb3e671bbea16800',
  'git symbolic-ref --quiet --short HEAD': 'release',
}

const mockGit = (commands = gitCommands) => {
  const commandMap = new Map()

  for (const command in commands) {
    commandMap.set(command, commands[command])
  }

  jest.spyOn(child_process, 'execSync').mockImplementation((command) => {
    if (commandMap.has(command)) {
      const result = commandMap.get(command)

      return typeof result === 'function' ? result() : result
    }

    return `Unsupported command: ${command}: ${execSync(command)}`
    // return execSync(command)
  })
}

module.exports = {
  failCommand,
  gitCommands,
  mockGit,
}

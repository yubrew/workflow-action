/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const main = require('../src/main')
const { run } = require('../src/main')
const github = require('@actions/github')

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('runs', async () => {
    await main.run()
    expect(runMock).toHaveReturned()
  })
})

// ai unit tests

jest.mock('@actions/core')
jest.mock('@actions/github')

test('All valid inputs', async () => {
  const mockListFiles = jest.fn().mockResolvedValue({
    data: [
      {
        filename: 'test.md',
        additions: 10,
        deletions: 5,
        changes: 15
      },
      {
        filename: 'test.js',
        additions: 20,
        deletions: 10,
        changes: 30
      }
    ]
  })

  const mockAddLabels = jest.fn().mockResolvedValue({})
  const mockCreateComment = jest.fn().mockResolvedValue({})

  const mockOctokit = {
    rest: {
      pulls: {
        listFiles: mockListFiles
      },
      issues: {
        addLabels: mockAddLabels,
        createComment: mockCreateComment
      }
    }
  }

  github.getOctokit.mockReturnValue(mockOctokit)

  core.getInput.mockReturnValueOnce('owner')
  core.getInput.mockReturnValueOnce('repo')
  core.getInput.mockReturnValueOnce('1')
  core.getInput.mockReturnValueOnce('token')

  await run()

  expect(core.getInput).toHaveBeenCalledWith('owner', { required: true })
  expect(core.getInput).toHaveBeenCalledWith('repo', { required: true })
  expect(core.getInput).toHaveBeenCalledWith('pr_number', { required: true })
  expect(core.getInput).toHaveBeenCalledWith('token', { required: true })

  expect(github.getOctokit).toHaveBeenCalledWith('token')
  expect(mockListFiles).toHaveBeenCalledWith({
    owner: 'owner',
    repo: 'repo',
    pull_number: '1'
  })

  expect(mockAddLabels).toHaveBeenCalledWith({
    owner: 'owner',
    repo: 'repo',
    issue_number: '1',
    labels: ['markdown']
  })
  expect(mockAddLabels).toHaveBeenCalledWith({
    owner: 'owner',
    repo: 'repo',
    issue_number: '1',
    labels: ['javascript']
  })

  expect(mockCreateComment).toHaveBeenCalledWith({
    owner: 'owner',
    repo: 'repo',
    issue_number: '1',
    body: expect.stringContaining('Pull Request #1 has been updated with:')
  })

  expect(core.setFailed).not.toHaveBeenCalled()
})

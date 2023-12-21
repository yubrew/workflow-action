const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
  try {
    const owner = core.getInput('owner', { required: true })
    const repo = core.getInput('repo', { required: true })
    const prNumber = core.getInput('pr_number', { required: true })
    const token = core.getInput('token', { required: true })

    const octokit = new github.getOctokit(token)

    const { data: changedFiles } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber
    })

    let diffData = {
      additions: 0,
      deletions: 0,
      changes: 0
    }

    diffData = changedFiles.reduce((acc, file) => {
      acc.additions += file.additions
      acc.deletions += file.deletions
      acc.changes += file.changes
      return acc
    }, diffData)

    for (const file of changedFiles) {
      const fileExtension = file.filename.split('.').pop()
      switch (fileExtension) {
        case 'md':
          await octokit.rest.issues.addLabels({
            owner,
            repo,
            issue_number: prNumber,
            labels: ['markdown']
          })
          break
        case 'js':
          await octokit.rest.issues.addLabels({
            owner,
            repo,
            issue_number: prNumber,
            labels: ['javascript']
          })
          break
        case 'yml':
        case 'yaml':
          await octokit.rest.issues.addLabels({
            owner,
            repo,
            issue_number: prNumber,
            labels: ['yaml']
          })
          break
        case 'rs':
          await octokit.rest.issues.addLabels({
            owner,
            repo,
            issue_number: prNumber,
            labels: ['rust']
          })
          break
        case 'sol':
          await octokit.rest.issues.addLabels({
            owner,
            repo,
            issue_number: prNumber,
            labels: ['solidity']
          })
          break
      }
    }

    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: `
        Pull Request #${prNumber} has been updated with:
        - ${diffData.changes} changes
        - ${diffData.additions} additions
        - ${diffData.deletions} deletions
      `
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}

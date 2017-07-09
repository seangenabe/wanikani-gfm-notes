const FS = require('mz/fs')
const loudRejection = require('loud-rejection')
const ChildProcess = require('mz/child_process')
const mkdirp = require('mkdirp')

loudRejection()

const root = `${__dirname}/..`

async function run() {
  const pkg = require('../package')
  let source = await FS.readFile(`${root}/index.js`, 'utf8')
  const revList = await ChildProcess.exec('git rev-list HEAD | wc -l')
  const revParse = await ChildProcess.exec('git rev-parse HEAD')
  const gitRevisionCount = revList[0].toString().trim()
  const gitCommitHash = revParse[0].toString().trim()

  source = source.replace('0.0.0.DYNAMIC_VERSION_NUMBER', `${pkg.version}.${gitRevisionCount}.r${gitCommitHash.substring(0, 7)}`)
  mkdirp(`${root}/dist`)
  await FS.writeFile(`${root}/dist/wanikani-gfm-notes.user.js`, source)
}

run()

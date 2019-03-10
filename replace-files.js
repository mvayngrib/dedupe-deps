const path = require('path')
const { findModuleJsFiles } = require('./find-files')
const fs = require('./fs')
const debug = require('./debug')
const BANNER = '// deduped by dedupe-deps'

const replaceFiles = async ({ name, canonical, duplicate }) => {
  const canDir = path.dirname(canonical.path)
  const dupDir = path.dirname(duplicate.path)
  const remapPath = relDupPath => {
    const dupFileParentDir = path.join(dupDir, path.dirname(relDupPath))
    return path.join(path.relative(dupFileParentDir, canDir), relDupPath)
  }

  const remapFile = async relDupPath => {
    const absDupPath = path.resolve(dupDir, relDupPath)
    const canPath = remapPath(relDupPath)

    debug(`deduping module ${name}, file ${absDupPath}`)

    return fs.writeFile(
      absDupPath,
      `${BANNER}
module.exports = require('${canPath}')`
    )
  }

  const jsFiles = await findModuleJsFiles(dupDir)
  await Promise.all(jsFiles.map(filePath => remapFile(filePath)))
}

module.exports = {
  replaceFiles
}

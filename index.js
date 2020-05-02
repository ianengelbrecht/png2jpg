#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')

var jimp = require('jimp');
let ProgressBar = require('progress')
const program = require('commander')

const isDirectory = itemPath => fs.lstatSync(itemPath).isDirectory()

program
.option('-p,--png-path <pngPath>', 'Path to png files')
.parse(process.argv)

if(program.pngPath && program.pngPath.trim()) {
  //read the directory contents
  const imageDir = program.pngPath.trim()

  fs.readdir(imageDir).then(async list => {

    let dirs = list.filter(x => isDirectory(path.join(imageDir, x)))

    let bar = new ProgressBar('[:bar] :current :percent :etas', { width: 50, total: dirs.length })

    for (const dir of dirs) {

      let dirList
      try {
        dirList = await fs.readdir(path.join(imageDir, dir))
      }
      catch(err) {
        console.log('error reading subdirectory: ' + err.message)
        return
      }

      let pngs = dirList.filter(filePath => path.extname(filePath).toUpperCase() == '.PNG')

      for (const png of pngs){
        try {
          await png2jpg(path.join(imageDir, dir, png), 80)
        }
        catch(err) {
          console.log(`error converting file ${png}: ${err.message}`)
          return
        }
      }
      bar.tick()
    }
    console.log('all done')
  })
  .catch(err => {
    console.log('error reading directory: ', err.message)
  })
}
else {
  console.log("A valid file path is required")
}

const png2jpg = async (pngPath, qual) => {
  let fileName = path.basename(pngPath).replace(path.extname(pngPath), "")
  let dirPath = path.dirname(pngPath) 
  await jimp.read(pngPath).then(res => {
    return res.quality(qual).writeAsync(`${path.join(dirPath,fileName)}.jpg`)
  })
  .catch(err => {throw(err)})
}
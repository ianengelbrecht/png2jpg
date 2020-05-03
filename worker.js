const path = require('path')

var workerpool = require('workerpool')
const jimp = require('jimp')
const getColors = require('get-image-colors')

workerpool.worker({png2jpg: png2jpg})

const distinct = (value, index, self) => self.indexOf(value) === index

async function png2jpg(pngPath) {
  let fileName = path.basename(pngPath).replace(path.extname(pngPath), "")
  let dirPath = path.dirname(pngPath) 
  let file
  try{
    file = await jimp.read(pngPath)
  }
  catch(err) {
    return {status: 'failed', error: "failed to read png", message: err.message}
  }

  try{
    await file.quality(80).writeAsync(`${path.join(dirPath,fileName)}.jpg`)
  }
  catch(err) {
    return {status: 'failed', error: "failed to convert file", message: err.message}
  }
  return { status: 'success' }
  
}
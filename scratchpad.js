const jimp = require('jimp')
const getColors = require('get-image-colors')

const distinct = (value, index, self) => self.indexOf(value) === index

async function readfile(filepath) {
  let file = await jimp.read(filepath)
  let b = await file.getBufferAsync(jimp.AUTO)
  let colours = await getColors(b, 'image/png')
  colours = colours.map(c => c.hex())
  let uniqueColours = colours.filter(distinct)
  console.log('all done')
}

let filepath = String.raw`D:\GISData\1to50kTopocadastrals\maptiles\12\2412\1702.png`
readfile(filepath)
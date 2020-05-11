//To batch add projections to a set of files

const fs = require('fs-extra')
const path = require('path')
const { execSync } = require("child_process");

let tifDir =String.raw`D:\GISData\1to250000TopoCadastrals`

const isFile = itemPath => fs.lstatSync(itemPath).isFile()

fs.readdir(tifDir).then(list =>{
    let files = list.filter(item => isFile(path.join(tifDir, item)))
    let tifs = files.filter(file => path.extname(file).toLowerCase() =='.tif')
    for (let tif of tifs) {
        let filePath = path.join(tifDir, tif)
        try {
            execSync(`gdal_edit.py -a_srs EPSG:4326 ${filePath}`)
        }
        catch(err){
            console.log(`error updating ${tif}: ${err.message}`)
        }
    }
    console.log('all done')
})
.catch(err => {
    console.log('error reading directory:' + err.message)
})
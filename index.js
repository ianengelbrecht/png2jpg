#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const { PerformanceObserver, performance } = require('perf_hooks');

let ProgressBar = require('progress')
const program = require('commander')
var workerpool = require('workerpool')
const prettyms = require('pretty-ms');
 
const isDirectory = itemPath => fs.lstatSync(itemPath).isDirectory()

program
.option('-p,--png-path <pngPath>', 'Path to png files --must be one of the zoom level folders')
.parse(process.argv)

if(program.pngPath && program.pngPath.trim()) {
  //read the directory contents
  const imageDir = program.pngPath.trim()

  //recording performance
  const obs = new PerformanceObserver((list, observer) => {
    let duration = list.getEntries()[0].duration
    let displayTime = prettyms(duration)
    console.log('Total time: ', displayTime);
    performance.clearMarks();
    observer.disconnect();
  });
  obs.observe({ entryTypes: ['measure'] });

  performance.mark('start');

  fs.readdir(imageDir).then(async dirlist => {

    const pool = workerpool.pool(__dirname + '/worker.js')

    let subdirs = dirlist.filter(x => isDirectory(path.join(imageDir, x))) //these are the 'xs' of the /{z}/{x}/{y} format for maptiles

    let bar = new ProgressBar('[:bar] :current/:total :percent', { width: 50, total: subdirs.length })

    for (const subdir of subdirs) {

      let subdirList
      try {
        subdirList = await fs.readdir(path.join(imageDir, subdir))
      }
      catch(err) {
        console.log('error reading subdirectory: ' + err.message)
        return
      }

      let pngs = subdirList.filter(filePath => path.extname(filePath).toUpperCase() == '.PNG')

      let pngPaths = pngs.map(png => path.join(imageDir, subdir, png))

      let subdirProms = []
      pngPaths.forEach(pngPath => subdirProms.push(pool.exec('png2jpg', [pngPath])))

      await Promise.all(subdirProms)

      let failed = subdirProms.filter(res => res.status == 'failed')
      if (failed.length > 0){
        console.log(`there were errors processing ${failed.length} files in ${subdir}`)
      }

      bar.tick()

    }

    pool.terminate()
    performance.measure('start to end', 'start') //this triggers the console.log of the time
    //console.log('all done')
    return

  })
  .catch(err => {
    console.log('error reading directory: ', err.message)
    return
  })
}
else {
  console.log("A valid file path is required")
  return
}


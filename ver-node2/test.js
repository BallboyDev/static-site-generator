const fs = require('fs')

const file = fs.readFileSync('./_post/develop.md', 'utf8').trim()

const point = [...file.matchAll(/---/g)].map((v) => { return v.index })

if (point[0] === 0) {
    const temp = file.substring(point[0], point[1] + 3)
    console.log(point[0], point[1] + 3)
    console.log(temp)
} else {
    console.log('no data')
}



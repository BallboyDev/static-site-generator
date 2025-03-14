const fs = require('fs')

const main = {
    build: () => {
        console.log('##### [ build ] #####')
    },
    tree: () => {
        console.log('##### [ tree ] #####')

        const readDir = (path) => {
            let html = ''

            const blog = fs.readdirSync(path).sort((v) => {
                const isDir = fs.statSync(`${path}/${v}`).isDirectory()
                return isDir ? 1 : 0

            })

            blog.map((v) => {
                const temp = fs.statSync(`${path}/${v}`).isDirectory()


                if (temp) {
                    const rand = Math.floor(Math.random() * 999999)
                    html = `${html}\n<li class="cate" id="t-${rand}">${v}</li>`
                    html = `${html}\n<ul id="c-${rand}" style="display: none;">${readDir(`${path}/${v}`)}</ul>`
                } else {
                    const [title, date] = v.split('_')
                    html = `${html}\n<li class="docu">${title}</li>`
                }

            })

            return html

        }


        const result = readDir('_blog')
        console.log(result)

    }
}

main[process.env.NODE_ENV]()
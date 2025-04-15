const fs = require('fs')
const path = require('path')
const { marked } = require('marked')

const post = require('./_layout/post')

const env = process.env.NODE_ENV

const utils = {
    path: {
        post: '_post',
        dist: '_dist',
        assets: '_assets',
        dev: `file://${__dirname}/_dist`,
        build: 'https://ballboyDev.github.io',
    },
    post: {},
    navi: [],
    contents: []
}

const app = {
    run: () => {
        console.log(`##### [ app.run < ${env} > ] #####`)

        app.init()
        app.mkJson();
        app.mkNavi();
        app.mkMainPage();
        app.mkPostPage();
    },
    init: () => {
        console.log('##### [ app.init ] #####')

        if (fs.existsSync(utils.path.dist)) {
            fs.rmSync(utils.path.dist, { recursive: true })
        }
        fs.mkdirSync(`${utils.path.dist}`)
        fs.mkdirSync(`${utils.path.dist}/post`)
        fs.mkdirSync(`${utils.path.dist}/assets`)
        fs.mkdirSync(`${utils.path.dist}/assets/img`)

        fs.copyFileSync(`${utils.path.assets}/skin.css`, `${utils.path.dist}/assets/skin.css`)
        fs.copyFileSync(`${utils.path.assets}/markdown.css`, `${utils.path.dist}/assets/markdown.css`)
        fs.copyFileSync(`${utils.path.assets}/skin.js`, `${utils.path.dist}/assets/skin.js`)
        fs.cpSync(`${utils.path.assets}/img/`, `${utils.path.dist}/assets/img/`, { recursive: true })

    },
    mkJson: () => {
        console.log('##### [ app.mkJson ] #####')

        const recursion = (root) => {
            const temp = {}

            const post = fs.readdirSync(root).filter((v) => { return v !== '_Common' })

            post.map((v) => {
                const isDir = fs.statSync(`${root}/${v}`).isDirectory()
                const [title, num] = path.basename(v, path.extname(v)).split('_')

                // temp[`${isDir ? `dir` : 'post'}_${num}`] = {
                const item = { // ballboy
                    title: title,
                    index: parseInt(num),
                    posting: parseInt(num) !== 0,
                    ...(isDir ?
                        { children: { ...recursion(`${root}/${v}`) } } :
                        { path: `${root}/${v}` }
                    )
                }

                temp[`${isDir ? `dir` : 'post'}_${title}_${num}`] = item

                if (!isDir) {
                    utils.contents.push(item)
                }
            })

            return temp
        }

        utils.post = { ...recursion(utils.path.post) }

        if (env === 'dev') {
            fs.writeFileSync(`${__dirname}/test/test.json`, JSON.stringify(utils.post))
        }
    },
    mkNavi: () => {
        console.log('##### [ app.mkNavi ] #####')

        const tagList = []

        const recursion = (root) => {
            const item = Object.keys(root)

            item.map((v) => {
                if (!!root[v].posting) {
                    tagList.push(`<li>${root[v].title}</li>`)

                    if (!!root[v]?.children) {
                        tagList.push('<ul>')
                        tagList.push(recursion(root[v].children))
                        tagList.push('</ul>')
                    }
                }

            })
            return tagList
        }

        recursion(utils.post)
        utils.navi = tagList

        if (env === 'dev') {
            fs.writeFileSync(`${__dirname}/test/navi.html`, tagList.join('\n'))
        }
    },
    mkMainPage: () => {
        console.log('##### [ app.mkMainPage ] #####')
    },
    mkPostPage: () => {
        console.log('##### [ app.mkPostPage ] #####')

        utils.contents.map((v) => {
            console.log(v)
            const mdFile = fs.readFileSync(v.path, 'utf8').trim()
            const htmlFile = marked.parse(mdFile)

            const metaData = {
                url: utils.path.dev,
                prev: 0,
                next: 0,
                navi: utils.navi,
                contents: htmlFile
            }

            const result = post.output(metaData)

            fs.writeFileSync(`${utils.path.dist}/post/${v.index}.html`, result)
        })
    }
}

app.run()
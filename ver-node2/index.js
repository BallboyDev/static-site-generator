const fs = require('fs')
const markdownIt = require('markdown-it')
const path = require('path')
const layout = require('./_layout/layout')

const json = {
    common: {
        post: '_post',
        dist: '_dist',
        assets: '_assets'
    },
    dev: {
        url: `file://${__dirname}/_dist`
    },
    build: {
        url: 'https://lazydev500.github.io'
    }
}

const utils = {
    sideBar: '',
    dirNumber: [],
    clear: () => {
        console.log('##### [ clear ] #####')

        if (fs.existsSync(json.common.dist)) {
            fs.rmSync(json.common.dist, { recursive: true })
        }
        fs.mkdirSync(`${json.common.dist}`)
        fs.mkdirSync(`${json.common.dist}/post`)
        fs.mkdirSync(`${json.common.dist}/assets`)
        fs.mkdirSync(`${json.common.dist}/assets/img`)

    },
    mkSideBar: () => {
        console.log('##### [ mkSideBar ] #####')

        const dirNumber = []

        const makeSideBar = (root) => {
            let html_sideBar = ''

            const post = fs.readdirSync(root).sort((v) => {
                const isDir = fs.statSync(`${root}/${v}`).isDirectory()
                return isDir ? 1 : 0
            })

            post.map((v) => {
                const isDir = fs.statSync(`${root}/${v}`).isDirectory()
                if (v === 'index.md') { }
                else if (isDir) {
                    const [title, dirNum] = v.split('_')

                    dirNumber.push(dirNum)

                    html_sideBar = `${html_sideBar}\n<li class="cate" id="t-${dirNum}">${title}</li>`
                    html_sideBar = `${html_sideBar}\n<ul id="c-${dirNum}" style="display: d-[${dirNum}];">\n${makeSideBar(`${root}/${v}`)}\n</ul>`
                } else {
                    const [title, date, fileNum] = path.basename(v, path.extname(v)).split('_')
                    if (!!fileNum) {
                        // html_sideBar = `${html_sideBar}\n<a href="${process.env.NODE_ENV === 'dev' ? dev : build}/${fileNum}.html"><li class="docu s-[${fileNum}]">${title}</li></a>`
                        html_sideBar = `${html_sideBar}\n<a href="${json[process.env.NODE_ENV].url}/post/${fileNum}.html"><li class="docu s-[${fileNum}]">${title}</li></a>`
                    }

                }
            })
            return html_sideBar
        }

        const result = makeSideBar(json.common.post)

        utils.dirNumber = dirNumber
        utils.sideBar = result
    },
    mkPost: () => {
        console.log('##### [ mkPost ] #####')

        const mdToHtml = (root, fold = []) => {
            const post = fs.readdirSync(root)

            post.map((v) => {
                const isDir = fs.statSync(`${root}/${v}`).isDirectory()

                if (isDir) {
                    const [title, dirNum] = v.split('_')
                    mdToHtml(`${root}/${v}`, [...fold, dirNum])
                } else {
                    console.log('convert file >>', `${root}/${v}`)
                    const [title, date, fileNum] = path.basename(v, path.extname(v)).split('_')

                    const mdFile = fs.readFileSync(`${root}/${v}`, 'utf8')
                    let sideBar = utils.sideBar

                    utils.dirNumber.map((v) => {
                        sideBar = sideBar.replace(`d-[${v}]`, (fold.indexOf(v) >= 0) ? 'block' : 'none')
                    })

                    const contents = layout.post(sideBar, markdownIt().render(mdFile)).replace(`s-[${fileNum}]`, `selected`)
                    fs.writeFileSync(`${json.common.dist}/post/${fileNum}.html`, contents)


                }
            })
        }

        mdToHtml(json.common.post)
    },
    mkAssets: () => {
        console.log('##### [ mkAssets ] #####')

        fs.copyFileSync(`${json.common.assets}/skin.css`, `${json.common.dist}/assets/skin.css`)
        fs.copyFileSync(`${json.common.assets}/skin.js`, `${json.common.dist}/assets/skin.js`)
    },
    mkIndex: () => {
        console.log('##### [ mkIndex ] #####')

        let sideBar = utils.sideBar

        utils.dirNumber.map((v) => {
            sideBar = sideBar.replace(`d-[${v}]`, 'none')
        })

        const mdFile = fs.readFileSync(`${json.common.post}/index.md`, 'utf8')

        const contents = layout.index(sideBar, markdownIt().render(mdFile))
        fs.writeFileSync(`${json.common.dist}/index.html`, contents)
    }

}

// 빌드 파일 초기화
utils.clear()

// 사이드바 변환
utils.mkSideBar()

// 메인 컨텐츠 변환
utils.mkPost()

// index.html 생성
utils.mkIndex()

// css, js 파일 생성
utils.mkAssets()
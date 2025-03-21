const fs = require('fs')
const markdownIt = require('markdown-it')
const { marked } = require('marked')
const path = require('path')
const layout = require('./_layout/layout')
const { default: axios } = require('axios')
const dayjs = require('dayjs')

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
        url: 'https://ballboyDev.github.io'
    }
}

const utils = {
    sideBar: '',
    dirNumber: [],
    baseFile: ['index.md', 'develop.md', 'template.md'],
    postList: [],
    clear: () => {
        console.log('\n##### [ clear ] #####')

        if (fs.existsSync(json.common.dist)) {
            fs.rmSync(json.common.dist, { recursive: true })
        }
        if (fs.existsSync(`${__dirname}/list.md`)) {
            fs.rmSync(`${__dirname}/list.md`)
        }
        fs.mkdirSync(`${json.common.dist}`)
        fs.mkdirSync(`${json.common.dist}/post`)
        fs.mkdirSync(`${json.common.dist}/assets`)
        fs.mkdirSync(`${json.common.dist}/assets/img`)

    },
    mkSideBar: () => {
        console.log('\n##### [ mkSideBar ] #####')

        const dirNumber = []

        const makeSideBar = (root) => {
            let html_sideBar = ''

            // const post = fs.readdirSync(root).sort((v) => {
            //     const isDir = fs.statSync(`${root}/${v}`).isDirectory()
            //     return isDir ? 1 : 0
            // })
            const post = fs.readdirSync(root)
                .sort((a, b) => {
                    const aIsDir = fs.statSync(`${root}/${a}`).isDirectory()
                    const bIsDir = fs.statSync(`${root}/${b}`).isDirectory()

                    if (aIsDir && bIsDir) {
                        const [aTitle, aDirNum] = a.split('_')
                        const [bTitle, bDirNum] = b.split('_')
                        return parseInt(aDirNum) - parseInt(bDirNum)
                    } else if (aIsDir && !bIsDir) {
                        return 1
                    } else if (!aIsDir && bIsDir) {
                        return -1
                    } else {
                        const [aTitle, aDate, aFileNum] = path.basename(a, path.extname(a)).split('_')
                        const [bTitle, bDate, bFileNum] = path.basename(b, path.extname(b)).split('_')

                        return parseInt(aFileNum) - parseInt(bFileNum)

                    }
                })

            post.map((v) => {
                const isDir = fs.statSync(`${root}/${v}`).isDirectory()
                if (utils.baseFile.some((file) => { return file === v })) { }
                else if (isDir) {
                    const [title, dirNum] = v.split('_')

                    dirNumber.push(dirNum)

                    html_sideBar = `${html_sideBar}\n<li class="cate" id="t-${dirNum}">${title}</li>`
                    html_sideBar = `${html_sideBar}\n<ul id="c-${dirNum}" style="display: d-[${dirNum}];">\n${makeSideBar(`${root}/${v}`)}\n</ul>`
                } else {
                    const [title, date, fileNum] = path.basename(v, path.extname(v)).split('_')
                    if (parseInt(fileNum) !== 0) {
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
        console.log('\n##### [ mkPost ] #####')

        const mdToHtml = (root, fold = []) => {
            const post = fs.readdirSync(root)

            post.map((v) => {
                const isDir = fs.statSync(`${root}/${v}`).isDirectory()

                if (utils.baseFile.some((file) => { return file === v })) { }
                else if (isDir) {
                    const [title, dirNum] = v.split('_')
                    mdToHtml(`${root}/${v}`, [...fold, dirNum])
                } else {
                    const [title, date, fileNum] = path.basename(v, path.extname(v)).split('_')

                    const mdFile = fs.readFileSync(`${root}/${v}`, 'utf8')

                    let sideBar = utils.sideBar

                    utils.dirNumber.map((v) => {
                        sideBar = sideBar.replace(`d-[${v}]`, (fold.indexOf(v) >= 0) ? 'block' : 'none')
                    })

                    let temp = markdownIt().render(mdFile)
                    temp = temp.replaceAll(/(?<=")[^"]*(?=assets)/g, `${json[process.env.NODE_ENV].url}/`)

                    const contents = layout.post(json[process.env.NODE_ENV].url, sideBar, temp, title).replaceAll(`s-[${fileNum}]`, `selected`)

                    const fileName = parseInt(fileNum) !== 0 ? fileNum : `${fileNum} [ ${title} ]`
                    fs.writeFileSync(`${json.common.dist}/post/${fileName}.html`, contents)

                    console.log(`${v} ==> ${json.common.dist}/post/${fileName}.html`)

                    utils.postList.push(v)

                }
            })
        }

        mdToHtml(json.common.post)
    },
    mkAssets: () => {
        console.log('\n##### [ mkAssets ] #####')

        fs.copyFileSync(`${json.common.assets}/skin.css`, `${json.common.dist}/assets/skin.css`)
        fs.copyFileSync(`${json.common.assets}/markdown.css`, `${json.common.dist}/assets/markdown.css`)
        fs.copyFileSync(`${json.common.assets}/skin.js`, `${json.common.dist}/assets/skin.js`)
        fs.cpSync(`${json.common.assets}/img/`, `${json.common.dist}/assets/img/`, { recursive: true })

    },
    mkIndex: () => {
        console.log('\n##### [ mkIndex ] #####')

        let sideBar = utils.sideBar

        utils.dirNumber.map((v) => {
            sideBar = sideBar.replace(`d-[${v}]`, 'none')
        })

        utils.baseFile.map((v) => {
            const mdFile = fs.readFileSync(`${json.common.post}/${v}`, 'utf8')

            let temp = markdownIt().render(mdFile)
            temp = temp.replaceAll(/(?<=")[^"]*(?=assets)/g, `${json[process.env.NODE_ENV].url}/`)

            const contents = layout.post(json[process.env.NODE_ENV].url, sideBar, temp, '')
            fs.writeFileSync(`${json.common.dist}/${path.basename(v, path.extname(v))}.html`, contents)

            console.log(`${v} ==> ${json.common.dist}/${path.basename(v, path.extname(v))}.html`)
        })
    },
    mkPostList: async () => {
        console.log('\n##### [ mkPostList ] #####')

        let contents = `# Post List (${dayjs().format('YYYYMMDD')})\n\n`
        const list = []

        for (let i = 0; i < utils.postList.length; i++) {
            const [title, date, index] = path.basename(utils.postList[i], path.extname(utils.postList[i])).split('_')
            let status = false

            try {
                let temp = await axios.get(`${json.build.url}/post/${index}.html`)
                status = temp.status === 200
            } catch (err) {
                // console.log(err)
            }

            const post = {
                title, date, index,
                upload: status,
                contents: `${index}. ${title}\n${date} => ${status ? `${json.build.url}/post/${index}.html` : 'no upload'}\n\n`
            }

            list.push(post)
        }

        list.sort((a, b) => { return parseInt(a.index) - parseInt(b.index) }).map((v) => {
            contents = `${contents}${v.contents}`
            // console.log(v.contents)
        })

        fs.writeFileSync(`${__dirname}/posting.md`, contents)
    }
}

const main = {
    init: () => {
        if (process.env.NODE_ENV === 'clear') {
            main.clear()
        } else { // NODE_ENV === 'dev' or 'build'
            main.convert()
        }
    },
    clear: () => {
        utils.clear()
    },
    convert: async () => {
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

        // 작성 포스트 리스트 정리
        await utils.mkPostList()
    }
}

main.init()
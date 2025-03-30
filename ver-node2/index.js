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
    totalCount: 0,
    dirNumber: [],
    baseFile: ['index.md', 'develop.md', 'template.md'],
    postList: [],
    clear: () => {
        console.log('\n##### [ clear ] #####')

        if (fs.existsSync(json.common.dist)) {
            fs.rmSync(json.common.dist, { recursive: true })
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
            let htmlList = []

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
                        const [aTitle, aFileNum] = path.basename(a, path.extname(a)).split('_')
                        const [bTitle, bFileNum] = path.basename(b, path.extname(b)).split('_')

                        return parseInt(aFileNum) - parseInt(bFileNum)

                    }
                })

            const pIsDir = post.map((v) => {
                // return 1: 포스팅 된 파일 / 0: 포스팅 전 or 포스팅 안할 파일 / -1: 디렉토리
                const type = fs.statSync(`${root}/${v}`).isDirectory()

                if (!type) {
                    const [title, fileNum] = path.basename(v, path.extname(v)).split('_')
                    if (parseInt(fileNum) !== 0) {
                        return 1
                    } else {
                        return 0
                    }
                } else {
                    return -1
                }
            })
            let count = pIsDir.filter((v) => {
                return v === 1
            }).length

            post.map((v, i) => {
                // const isDir = fs.statSync(`${root}/${v}`).isDirectory()
                const isDir = pIsDir[i] === -1

                if (utils.baseFile.some((file) => { return file === v })) { }
                else if (isDir) {
                    const [title, dirNum] = v.split('_')

                    if (!!dirNum && dirNum !== '0') {
                        dirNumber.push(dirNum)

                        const temp = makeSideBar(`${root}/${v}`)
                        count = count + temp.count

                        htmlList.push(`<li class="cate" id="t-${dirNum}">${title} (${temp.count})</li>`)
                        htmlList.push(`<ul id="c-${dirNum}" style="display: d-[${dirNum}];">\n${temp.html}\n</ul>`)
                    }

                } else {
                    const [title, fileNum] = path.basename(v, path.extname(v)).split('_')
                    if (parseInt(fileNum) !== 0) {
                        htmlList.push(`<a href="${json[process.env.NODE_ENV].url}/post/${fileNum}.html"><li class="docu s-[${fileNum}]">${title}</li></a>`)
                    }
                }
            })

            return { html: htmlList.join('\n'), count: count }
        }

        const result = makeSideBar(json.common.post)

        utils.dirNumber = dirNumber
        utils.sideBar = result.html
        utils.totalCount = result.count - fs.readdirSync(json.common.post).filter((v) => { return utils.baseFile.some((file) => { return file === v }) }).length
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
                    const [title, fileNum] = path.basename(v, path.extname(v)).split('_')

                    let sideBar = utils.sideBar
                    utils.dirNumber.map((v) => {
                        sideBar = sideBar.replace(`d-[${v}]`, (fold.indexOf(v) >= 0) ? 'block' : 'none')
                    })

                    let tempMdFile = fs.readFileSync(`${root}/${v}`, 'utf8').trim()
                    const convertData = { title: title, totalCount: utils.totalCount }

                    const point = [...tempMdFile.matchAll(/```/g)].map((v) => { return v.index })
                    if (point[0] === 0) {
                        const tempData = tempMdFile.substring(point[0], point[1] + 3)
                        convertData['metaData'] = JSON.parse(tempData.replaceAll('```json', '').replaceAll('```', ''))
                        convertData['mdFile'] = marked.parse(tempMdFile.replace(tempData, '')).replaceAll(/(?<=")[^"]*(?=assets)/g, `${json[process.env.NODE_ENV].url}/`)
                    } else {
                        convertData['metaData'] = null
                        convertData['mdFile'] = marked.parse(tempMdFile).replaceAll(/(?<=")[^"]*(?=assets)/g, `${json[process.env.NODE_ENV].url}/`)
                    }

                    const contents = layout.post(json[process.env.NODE_ENV].url, sideBar, convertData).replaceAll(`s-[${fileNum}]`, `selected`)

                    const fileName = parseInt(fileNum) !== 0 ? fileNum : `${fileNum} [ ${title} ]`
                    fs.writeFileSync(`${json.common.dist}/post/${fileName}.html`, contents)

                    console.log(`${v} ==> ${json.common.dist}/post/${fileName}.html`)
                    // console.log(convertData.metaData)

                    utils.postList.push({
                        file: v,
                        metaData: { ...convertData.metaData }
                    })

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

            let tempMdFile = fs.readFileSync(`${json.common.post}/${v}`, 'utf8').trim()
            const convertData = { totalCount: utils.totalCount }

            const point = [...tempMdFile.matchAll(/```/g)].map((v) => { return v.index })
            if (point[0] === 0) {
                const tempData = tempMdFile.substring(point[0], point[1] + 3)
                convertData['metaData'] = JSON.parse(tempData.replaceAll('```json', '').replaceAll('```', ''))
                convertData['mdFile'] = marked.parse(tempMdFile.replace(tempData, '')).replaceAll(/(?<=")[^"]*(?=assets)/g, `${json[process.env.NODE_ENV].url}/`)
            } else {

                convertData['metaData'] = null
                convertData['mdFile'] = marked.parse(tempMdFile).replaceAll(/(?<=")[^"]*(?=assets)/g, `${json[process.env.NODE_ENV].url}/`)
            }

            const contents = layout.post(json[process.env.NODE_ENV].url, sideBar, convertData)
            fs.writeFileSync(`${json.common.dist}/${path.basename(v, path.extname(v))}.html`, contents)

            console.log(`${v} ==> ${json.common.dist}/${path.basename(v, path.extname(v))}.html`)
            // console.log(convertData.metaData)
        })
    },
    mkPostList: async () => {
        console.log('\n##### [ mkPostList ] #####')

        let contents = `# Post List (${dayjs().format('YYYYMMDD')})\n\n`
        let indexPage = `||index.html||||${json.build.url}/index.html|\n`

        contents = `${contents}||title|date|prev|next|url|\n|:-:|:--|:-:|:-:|:-:|:--|\n${indexPage}`

        const list = []

        for (let i = 0; i < utils.postList.length; i++) {
            let status = false
            const { file, metaData } = utils.postList[i]
            const [title, index] = path.basename(file, path.extname(file)).split('_')

            try {
                let temp = await axios.get(`${json.build.url}/post/${index}.html`)
                status = temp.status === 200
            } catch (err) {
                // console.log(err)
            }

            list.push({
                title,
                index,
                contents: `|${index}|${title}|${metaData.date}|${metaData?.prev || ''}|${metaData?.next || ''}|${status ? `${json.build.url}/post/${index}.html` : 'not yet'}|\n`
            })

        }

        list.sort((a, b) => { return parseInt(a.index) - parseInt(b.index) }).map((v) => {
            contents = `${contents}${v.contents}`
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
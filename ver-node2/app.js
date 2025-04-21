const fs = require('fs')
const path = require('path')
const { marked } = require('marked')
const matter = require('gray-matter')
const dayjs = require('dayjs')
const { default: axios } = require('axios')

const post = require('./_layout/post')

const env = process.env.NODE_ENV

const utils = {
    path: {
        index: '_post',
        // index: '/Users/ballboy/workspace/project/static-site-generator/post',
        post: '_post',
        // post: '/Users/ballboy/workspace/project/static-site-generator/post',
        dist: '_dist',
        assets: '_assets',
        dev: `file://${__dirname}/_dist`,
        build: 'https://ballboydev.github.io',
    },
    img: {},
    post: {},
    navi: [],
    contents: [],
    posting: [`# Posting List (${dayjs().format("YYYY.MM.DD")})\n`, '||title|date|prev|next|url|', '|:-:|:--|:-:|:-:|:-:|:--|'],
}

const app = {
    run: () => {
        console.log(`##### [ app.run < ${env} > ] #####`)

        app.init()
        app.mkJson();
        app.mkNavi();
        app.mkMainPage();
        app.mkPostPage();
        app.finalWork();
    },
    init: () => {
        console.log('\n##### [ app.init ] #####')

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

        console.log('>> set Environment <<')
        console.group('set Path')
        console.log(`index: ${utils.path.index}`)
        console.log(`post: ${utils.path.post}`)
        console.log(`build: ${utils.path.build}`)
        console.groupEnd()

        console.group('set Image')
        console.groupEnd()


    },
    mkJson: () => {
        console.log('\n##### [ app.mkJson ] #####')

        const recursion = (root, fold = []) => {
            const temp = {}

            // ballboy / index 파일과 공통 파일들의 관리 방안에 대하여 고민해보기
            const post = fs.readdirSync(root).filter((v) => { return ['_Common', 'index.md'].indexOf(v) < 0 })

            post.map((v) => {
                const isDir = fs.statSync(`${root}/${v}`).isDirectory();

                if (isDir) {
                    const [title, index] = path.basename(v, path.extname(v)).split('_');

                    if (parseInt(index) !== 0) {
                        const child = recursion(`${root}/${v}`, [...fold, index]);
                        const count = Object.keys(child).reduce((a, b) => {
                            const [type, index] = b.split('_');
                            return a + (type === 'dir' ? child[b].count : (parseInt(index) === 0 ? 0 : 1));
                        }, 0);

                        const item = {
                            title,
                            file: '',
                            index: parseInt(index),
                            count,
                            children: { ...child }
                        };

                        temp[`dir_${index}`] = item;
                    }
                } else {
                    const mdFile = matter(fs.readFileSync(`${root}/${v}`, 'utf8').trim());
                    const title = mdFile.data?.title;
                    const index = mdFile.data?.index || 0;

                    if (parseInt(index) !== 0) {
                        const item = {
                            title,
                            file: path.basename(v, path.extname(v)),
                            index: parseInt(index),
                            path: `${root}/${v}`,
                            fold,
                            date: mdFile.data?.date || '99999999',
                            ...mdFile.data,
                            content: mdFile.content
                        };

                        temp[`post_${index}`] = item;
                        utils.contents.push(item);
                    }
                }


            })

            return temp
        }

        utils.post = { ...recursion(utils.path.post) }

        fs.writeFileSync(`test/test.json`, JSON.stringify(utils.post))
    },
    mkNavi: () => {
        console.log('\n##### [ app.mkNavi ] #####')

        const tagList = []

        const recursion = (root) => {
            const item = Object.keys(root)

            item.sort((a, b) => {
                const [aType, aIndex] = a.split('_')
                const [bType, bIndex] = b.split('_')

                if (aType === bType) {
                    return parseInt(aIndex) - parseInt(bIndex)
                } else {
                    if (aType === 'post') {
                        return -1
                    } else {
                        return 1
                    }
                }
            }).map((v) => {
                const [type, num] = v.split('_')

                if (type === 'dir') {
                    tagList.push(`<li id="dt-${num}" onclick="foldNavi(${num})">${root[v].title} (${root[v].count})</li>`)
                    tagList.push(`<ul id="dc-${num}" style="display: none;">`)
                    tagList.push(recursion(root[v].children))
                    tagList.push('</ul>')
                } else {
                    tagList.push(`<a href="${utils.path[env]}/post/${num}.html">`)
                    tagList.push(`<li id="p-${num}">${root[v]?.title || root[v]?.file}</li>`)
                    tagList.push(`</a>`)
                }
            })

            return tagList
        }

        recursion(utils.post)
        utils.navi = tagList
    },
    mkMainPage: () => {
        console.log('\n##### [ app.mkMainPage ] #####')

        const mdFile = matter(fs.readFileSync(`${utils.path.index}/index.md`, 'utf8').trim())
        const htmlFile = marked.parse(mdFile.content)

        const metaData = {
            url: utils.path[env],
            index: 0,
            fold: [],
            prev: 0,
            next: 0,
            navi: utils.navi,
            contents: htmlFile
        }

        const result = post.output(metaData)

        fs.writeFileSync(`${utils.path.dist}/index.html`, result)

    },
    mkPostPage: () => {
        console.log('\n##### [ app.mkPostPage ] #####')

        utils.contents.sort((a, b) => {
            return a.index - b.index
        }).map((v) => {

            // ballboy / 포스팅 파일이 많아졌을때 성능/용량 이슈 발생 하지 않을지...?
            // const mdFile = matter(fs.readFileSync(v.path, 'utf8').trim())

            // ballboy / 이미지 URL 변환 작업
            // const htmlFile = marked.parse(mdFile.content).replaceAll(/(?<=")[^"]*(?=assets)/g, `${utils.path[env]}/`)

            // const metaData = {
            //     url: utils.path[env],
            //     index: v.index,
            //     fold: v.fold,
            //     prev: mdFile.data.prev || 0,
            //     next: mdFile.data.next || 0,
            //     navi: utils.navi,
            //     contents: htmlFile
            // }

            // ballboy / 이미지 URL 변환 작업
            const htmlFile = marked.parse(v.content)//.replaceAll(/(?<=")[^"]*(?=assets)/g, `${utils.path[env]}/`)

            const metaData = {
                url: utils.path[env],
                index: v.index,
                fold: v.fold,
                prev: v.prev || 0,
                next: v.next || 0,
                navi: utils.navi,
                contents: htmlFile
            }

            const result = post.output(metaData)

            fs.writeFileSync(`${utils.path.dist}/post/${v.index}.html`, result)
        })
    },
    finalWork: async () => {
        console.log('\n##### [ app.finalWork ] #####')

        for (let i = 0; i < utils.contents.length; i++) {
            const item = utils.contents[i]
            let status = false
            try {
                let temp = await axios.get(`${utils.path.build}/post/${item.index}.html`)
                status = temp.status === 200
            } catch (err) {
                console.log(`ERROR >> ${item.title}`)
            }

            const text = `|${item.index}|${item?.title || item?.file}|${item.date}|${item?.prev || ''}|${item?.next || ''}|${status ? `${utils.path.build}/post/${item.index}.html` : 'not yet'}|`
            console.log(text)
            utils.posting.push(text)
        }

        fs.writeFileSync(`posting.md`, utils.posting.join('\n'))
    }
}

app.run()
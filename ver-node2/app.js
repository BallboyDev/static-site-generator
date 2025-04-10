const fs = require('fs')
const path = require('path')

const json = {
    post: {}
}

const app = {
    init: () => {
        app.mkJson();
        app.mkNavi();
    },
    mkJson: () => {
        const tree = (root) => {
            const temp = {}
            const post = fs.readdirSync(root).filter((v) => { return v !== '_Common' })

            post.map((v) => {
                const isDir = fs.statSync(`${root}/${v}`).isDirectory()
                const [title, num] = path.basename(v, path.extname(v)).split('_')

                if (isDir) {
                    temp[`dir_${num}`] = {
                        title: title,
                        type: 'dir',
                        index: parseInt(num),
                        posts: { ...tree(`${root}/${v}`) }
                    }
                } else {
                    temp[`post_${num}`] = {
                        title: title,
                        type: 'post',
                        index: parseInt(num),
                        contents: 'read file',
                    }
                }
            })

            return temp
        }

        json.post = { ...tree('_post') }

        fs.writeFileSync(`${__dirname}/test/test.json`, JSON.stringify(json.post))
    },
    mkNavi: () => {

    }
}

app.init()
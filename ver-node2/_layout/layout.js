const layout = {
    post: (url, sideBar, contents) => {
        const html = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <link rel="stylesheet" href="${url}/assets/markdown.css">
    
    ${process.env.NODE_ENV === 'dev' ? `
        <link rel="stylesheet" href="${process.cwd()}/_assets/skin.css">
        <script src="${process.cwd()}/_assets/skin.js"></script>
    ` : `
        <link rel="stylesheet" href="${url}/assets/skin.css">
        <script src="${url}/assets/skin.js"></script>
    `}
</head>

<body>
    <div id="wrapper">
        <!-- side bar component -->
        <div id="side-bar">
            <div class="profile">
                <img class="img" src="${url}/assets/img/profile.jpeg" alt="" srcset="">
                <p>ballboy's blog</p>
                <p>welcome to my world</p>
            </div>
            <div class="category">
            <h3><a href="${url}/index.html">HOME</a></h3>
                <h3>카테고리</h3>
                <ul class="root">
                    ${sideBar}
                </ul>
            </div>

        </div>

        <!-- contents component -->
        <div id="contents">
            <div class="post markdown-body">
                ${contents}
            </div>
        </div>
    </div>
</body>

</html>
        `
        return html
    }
}


module.exports = layout
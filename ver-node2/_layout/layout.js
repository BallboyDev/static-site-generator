const layout = {
    profile: () => {
        return `
            <div class="profile">
                <img class="img" src="../_assets/img/profile.jpeg" alt="" srcset="">
                <p>ballboy's blog</p>
                <p>welcome to my world</p>
            </div>
            `
    },
    post: (url, sideBar, contents) => {
        const html = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <link rel="stylesheet" href="${url}/assets/skin.css">
    <link rel="stylesheet" href="${url}/assets/markdown.css">
    <script src="${url}/assets/skin.js"></script>
</head>

<body>
    <div id="wrapper">
        <!-- side bar component -->
        <div id="side-bar">
            ${layout.profile()}
            <div class="category">
            <h3><a href="">HOME</a></h3>
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
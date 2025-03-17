const layout = {
    profile: () => {
        return `
            <div class="profile">
                <div class="img"></div>
                <p>ballboy's blog</p>
                <p>welcome to my world</p>
            </div>
            `
    },
    post: (sideBar, contents) => {
        const html = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <link rel="stylesheet" href="../assets/skin.css">
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown.min.css"
        integrity="sha512-h/laqMqQKUXxFuu6aLAaSrXYwGYQ7qk4aYCQ+KJwHZMzAGaEoxMM6h8C+haeJTU1V6E9jrSUnjpEzX23OmV/Aw=="
        crossorigin="anonymous" referrerpolicy="no-referrer">
    <script src="../assets/skin.js"></script>
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
    },
    index: (sideBar, contents) => {
        const html = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <link rel="stylesheet" href="assets/skin.css">
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown.min.css"
        integrity="sha512-h/laqMqQKUXxFuu6aLAaSrXYwGYQ7qk4aYCQ+KJwHZMzAGaEoxMM6h8C+haeJTU1V6E9jrSUnjpEzX23OmV/Aw=="
        crossorigin="anonymous" referrerpolicy="no-referrer">
    <script src="assets/skin.js"></script>
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
                    ${sideBar || ''}
                </ul>
            </div>

        </div>

        <!-- contents component -->
        <div id="contents">
            <div class="post markdown-body">
                ${contents || ''}
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
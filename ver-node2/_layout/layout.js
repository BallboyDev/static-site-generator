const layout = {
    // post: (url, sideBar, contents, title) => {
    post: (url, sideBar, convertData) => {
        // console.log(url)
        // console.log(sideBar)
        // console.log(convertData)

        const html = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>심심한 개발자의 취미 생활에 오신걸 환영합니다.${!!convertData?.title ? `- ${convertData.title}` : ""} </title>

    <link rel="stylesheet" href="${url}/assets/markdown.css">
    
    ${process.env.NODE_ENV === "dev" ? `
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
        <div id="head-bar">
            <img id="openNavi" class="img"
                src="${url}/assets/img/profile.jpeg"
                alt="" srcset="">
            <div class="title">심심한 개발자의 취미생활</div>
        </div>
        <div id="side-bar">
            <img id="closeNavi" class="close"
                src="${url}/assets/img/close.svg"
                alt="" srcset="">
            <div class="profile">
                <img class="img" src="${url}/assets/img/profile.jpeg" alt="" srcset="">
                <p>심심한 개발자의 취미생활</p>
                <p>환영합니다.</p>
            </div>
            <hr />
            <h3 class="home"><a href="${url}/index.html">HOME</a></h3>
            <hr />
            <!-- <h3 class="category">카테고리 (${convertData.totalCount})</h3> -->
            <h3 class="category">카테고리</h3>
            <div class="navi">
                <ul class="root">
                    ${sideBar}
                </ul>
            </div>

        </div>

        <!-- contents component -->
        <div id="contents">
            
            ${!!convertData.metaData?.prev ? `
                <a href="${url}/post/${convertData.metaData.prev}.html" class="prev post">
                    <img 
                        src="${url}/assets/img/prev.svg"
                        alt="" srcset="">
                </a>
            ` : ""}
            

            ${!!convertData.metaData?.next ? `
                <a href="${url}/post/${convertData.metaData.next}.html" class="next post">
                    <img 
                        src="${url}/assets/img/next.svg"
                        alt="" srcset="">
                </a>
            ` : ''}
            
            
            <div class="main markdown-body">
                ${convertData.mdFile}
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
window.onload = () => {
    const categoryList = []
    const liList = document.getElementsByClassName('cate')

    for (let i = 0; i < liList.length; i++) {
        categoryList.push(liList[i].getAttribute('id').split('-')[1])
    }

    categoryList.map((v) => {
        const item = document.getElementById(`t-${v}`)
        item.onclick = () => {
            const category = document.getElementById(`c-${v}`)
            if (category.style.display === 'none') {
                category.style.display = 'block'
            } else {
                category.style.display = 'none'
            }

        }
    })

    const openNavi = document.getElementById('openNavi')
    const navi = document.getElementById('side-bar')
    const contents = document.getElementById('contents')
    openNavi.onclick = () => {
        navi.style.display = 'flex'
        contents.style.display = 'none'
    }

    const closeNavi = document.getElementById('closeNavi')
    closeNavi.onclick = () => {
        navi.style.display = 'none'
        contents.style.display = 'block'
    }


};


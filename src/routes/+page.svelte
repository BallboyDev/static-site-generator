<script>
    let items = [
        {
            title: 'test a',
            contents: 'contents a',
        },
        {
            title: 'test b',
            contents: 'contents b',
        },
        {
            title: 'test c',
            contents: 'contents c',
        }
    ]

    let open = 0
    let addItem = true

    const getData = () => {
        const title = document.getElementById("inputTitle").value
        const contents = document.getElementById("inputContents").value

        items = [...items, {
            title: title,
            contents: contents
        }]
    }
</script>

<style>
    .box {
        /* margin: 0 auto; */
        margin: 5rem auto 0 auto;

        /* height: 100%; */
        width: 514px;

        background-color: rgb(194, 194, 194);

        /* border-right: 1px solid black;
        border-left: 1px solid black; */
    }

    .list {
        border: 1px solid black;
    }

    .item>div {
        height: 1.5rem;
    }

    .title>input {
        /* width: 100%; */
    }
</style>

<div class="box">
    <div class="func">
        <button on:click={()=> {addItem = true}}>1</button>
        <button>2</button>
        <button>3</button>
        <button>4</button>
    </div>
    <div class="list">
        {#each items as item, index}
        <div class="item">
            <div class="title" on:click={()=> {open = index}}>{item.title}</div>
            {#if open === index}
            <div class="contents">{item.contents}</div>
            {/if}
        </div>
        {/each}

        {#if addItem === true}
        <div class="item">
            <div class="title">
                <input id="inputTitle" type="text" placeholder="input title" />
                <button on:click={getData}>0</button>
            </div>
            <div class="contents">
                <textarea id="inputContents"></textarea>
            </div>
        </div>
        {/if}
    </div>
</div>
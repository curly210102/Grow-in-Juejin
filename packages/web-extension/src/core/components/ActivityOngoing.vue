<script lang='ts'>
import SectionHeader from "../base-components/SectionHeader.vue"
import Slide from "../base-components/Slide.vue"

export default {
    components: {
        SectionHeader,
        Slide
    },
    data() {
        return {
            items: [{
                title: "A",
                category: "源码阅读",
                figure: "https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ab8c1236d554b33b60b4cae111bfbbd~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?",
                link: "https://juejin.cn/post/7194721470063312933?utm_source=web5&utm_medium=feed&utm_campaign=gengwen202302#comment"
            }, {
                title: "B",
                category: "日新计划",
                figure: "https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ab8c1236d554b33b60b4cae111bfbbd~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?",
                link: "https://juejin.cn/post/7194721470063312933?utm_source=web5&utm_medium=feed&utm_campaign=gengwen202302#comment"
            }, {
                title: "C",
                category: "沸点活动",
                figure: "https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ab8c1236d554b33b60b4cae111bfbbd~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?",
                link: "https://juejin.cn/post/7194721470063312933?utm_source=web5&utm_medium=feed&utm_campaign=gengwen202302#comment"
            }]
        }
    }
}

</script>
<template>
    <SectionHeader title="进行中的活动">
    </SectionHeader>
    <Slide :items="items"></Slide>
</template>
<script lang='ts' setup>
import { onMounted, ref } from 'vue';

const frame = ref<HTMLIFrameElement | null>(null);


onMounted(() => {
    window.addEventListener("message", ({ data }) => {
        console.log(data)
    })
})
</script>
<template>
    <iframe src="https://juejin.cn/" ref="frame"></iframe>
</template>
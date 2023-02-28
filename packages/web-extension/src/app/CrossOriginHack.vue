<script lang='ts' setup>
import { onMounted, ref } from 'vue';

const frame = ref<HTMLIFrameElement | null>(null);


onMounted(() => {

})
</script>
<template>
    <iframe src="https://juejin.cn/" ref="frame"></iframe>
</template>
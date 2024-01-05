<script lang="ts" setup>
const { title, id } = defineProps<{
    title: string,
    id: string
}>();
</script>
<template>
    <div>
        <a class="gij-text-primary hover:gij-text-primary-hover active:gij-text-primary-active gij-cursor-pointer focus:gij-outline-0"
            :href="`https://juejin.cn/post/${id}`" target="_blank">{{ title }}</a>
    </div>
    <div class="gij-text-main-text/60 gij-text-right">
        <slot></slot>
    </div>
</template>

<script lang='ts' setup>
const { title } = defineProps<{
    title: string
}>()
</script>
<template>
    <div class="flex justify-between space-x-2 items-end mb-3">
        <div class="text-slate-400  text-xs inline-block border-l-2 border-blue-400 pl-2">
            {{
                title
            }}</div>
        <slot></slot>
    </div>
</template>
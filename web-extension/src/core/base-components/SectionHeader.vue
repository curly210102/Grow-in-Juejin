<script lang='ts' setup>
const { title } = defineProps<{
    title: string
}>()
</script>
<template>
    <div class="gij-flex gij-justify-between gij-space-x-2 gij-items-end gij-mb-3">
        <div class="gij-text-slate-400 gij- gij-text-xs gij-inline-block gij-border-l-2 gij-border-blue-400 gij-pl-2">
            {{
                title
            }}</div>
        <slot></slot>
    </div>
</template>
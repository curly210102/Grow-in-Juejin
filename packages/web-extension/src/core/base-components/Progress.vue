<script lang='ts' setup>
import { toRef } from "vue";
const props = defineProps<{
    steps: number
}>()

const steps = toRef(props, "steps")

</script>
<template>
    <div
        class="gij-relative gij-rounded-full gij-p-2 gij-border gij-bg-gray-300/10 gij-w-full gij-overflow-hidden gij-shadow-inner gij-min-h-[6px]">
        <div class="gij-absolute gij-top-1 gij-left-1 gij-right-1 gij-bottom-1">
            <div class="gij-rounded-full gij-bg-gradient-to-r gij-from-blue-500 gij-to-blue-400 gij-h-full"
                :style="{ width: `${steps * 100}%` }">
            </div>
        </div>
        <span class="gij-relative gij-top-1/2 -gij-translate-y-1/2 gij-text-xs gij-font-semibold">
            <slot></slot>
        </span>
    </div>
</template>
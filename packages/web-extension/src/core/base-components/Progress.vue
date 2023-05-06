<script lang='ts' setup>
import { toRef } from "vue";
const props = defineProps<{
    steps: number,
    type?: "simple"
}>()

const steps = toRef(props, "steps")

</script>
<template>
    <div
        :class="['gij-relative gij-rounded-full gij-bg-gray-300/10 gij-w-full gij-overflow-hidden gij-shadow-inner gij-min-h-[6px]', props.type === 'simple' ? 'gij-p-1' : 'gij-p-2 gij-border']">
        <div
            :class="['gij-absolute', props.type === 'simple' ? 'gij-top-0 gij-left-0 gij-right-0 gij-bottom-0' : 'gij-top-1 gij-left-1 gij-right-1 gij-bottom-1']">
            <div class="gij-rounded-full gij-h-full gij-bg-gradient-to-r gij-from-blue-500 gij-to-blue-400"
                :style="{ width: `${steps * 100}%` }">
            </div>
        </div>
        <span class="gij-relative gij-top-1/2 -gij-translate-y-1/2 gij-text-xs gij-font-semibold">
            <slot></slot>
        </span>
    </div>
</template>
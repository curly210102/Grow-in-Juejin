<script lang='ts' setup>
import { defineProps, toRef } from "vue";
const props = defineProps<{
    steps: number
}>()

const steps = toRef(props, "steps")

console.log(steps.value)


</script>
<template>
    <div class="relative rounded-full p-2 border bg-gray-300/10 w-full overflow-hidden shadow-inner">
        <div class="absolute top-1 left-1 bottom-1 rounded-full bg-blue-500 min-h-[6px] "
            :style="{ width: `${steps * 100}%` }">
        </div>
        <span class="relative top-1/2 -translate-y-1/2 text-xs font-semibold">
            <slot></slot>
        </span>
    </div>
</template>
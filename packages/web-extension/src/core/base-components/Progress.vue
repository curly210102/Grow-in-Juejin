<script lang='ts' setup>
import { toRef } from "vue";
const props = defineProps<{
    steps: number
}>()

const steps = toRef(props, "steps")

</script>
<template>
    <div class="relative rounded-full p-2 border bg-gray-300/10 w-full overflow-hidden shadow-inner min-h-[6px]">
        <div class="absolute top-1 left-1 right-1 bottom-1">
            <div class="rounded-full bg-gradient-to-r from-blue-500 to-blue-400 h-full"
                :style="{ width: `${steps * 100}%` }">
            </div>
        </div>
        <span class="relative top-1/2 -translate-y-1/2 text-xs font-semibold">
            <slot></slot>
        </span>
    </div>
</template>
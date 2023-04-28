<script lang='ts' setup>
import { ChevronDoubleRightIcon } from "@heroicons/vue/24/outline"

defineProps(['modelValue'])
defineEmits(['update:modelValue'])

</script>
<template>
    <div class="juejin-card gij-p-2 gij-text-slate-400 gij-flex gij-items-center gij-cursor-pointer gij-pl-8"
        @click="$emit('update:modelValue', false)" v-if="modelValue">
        <slot></slot>
        <ChevronDoubleRightIcon class="gij-w-4 gij-h-4" />
    </div>
</template>
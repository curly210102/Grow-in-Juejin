<template>
    <RadioGroup
        class="gij-inline-flex gij-items-center gij-rounded-l-full gij-rounded-r-full gij-bg-gray-300 gij-bg-opacity-widget gij-text-xs gij-text-slate-400 gij-p-1 gij-shadow-inner">
        <RadioGroupOption v-for="item in items" v-slot="{ checked }" :value="item" :key="item.key" class="gij-group">
            <div
                :class="['gij-py-0.5 gij-px-3 gij-rounded-md group-first:gij-rounded-l-full group-last:gij-rounded-r-full', checked ? 'gij-bg-main-bg gij-shadow' : 'gij-cursor-pointer gij-text-slate-400']">
                {{
                    item.text }}</div>
        </RadioGroupOption>
    </RadioGroup>
</template>
  
<script setup lang="ts">
import {
    RadioGroup,
    RadioGroupOption,
} from '@headlessui/vue'

const { items } = defineProps<{
    items: Array<{
        key: string | number,
        text: string
    }>
}>()
</script>
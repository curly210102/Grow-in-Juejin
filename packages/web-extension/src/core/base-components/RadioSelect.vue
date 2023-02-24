<template>
    <RadioGroup
        class="inline-flex items-center rounded-l-full rounded-r-full bg-gray-300/10 text-xs text-slate-400 p-1 shadow-inner">
        <RadioGroupOption v-for="item in items" v-slot="{ checked }" :value="item" :key="item.key" class="group">
            <div
                :class="['py-0.5 px-3 cursor-pointe rounded-md group-first:rounded-l-full group-last:rounded-r-full', checked ? 'bg-white shadow' : 'cursor-pointer text-slate-400']">
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
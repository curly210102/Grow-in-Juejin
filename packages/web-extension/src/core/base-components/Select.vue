<script setup lang="ts">
import { Ref, ref, toRef, toRefs, useAttrs, watch } from 'vue'
import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

export type Item = { key: number | string, text: string };
const props = defineProps<{
    items: Item[],
}>();


const { items } = toRefs(props);

const attrs = useAttrs();
const selected = toRef(attrs, "modelValue") as Ref<Item>;
</script>
  
<template>
    <Listbox>
        <div class="relative z-10">
            <ListboxButton
                class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left sm:text-sm text-slate-400 shadow-inner">
                <span class="block truncate">{{ selected.text }}</span>
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon class="h-5 w-5 text-slate-400" aria-hidden="true" />
                </span>
            </ListboxButton>

            <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <ListboxOptions
                    class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    <ListboxOption v-slot="{ active, selected }" v-for="item in items" :key="item.key" :value="item"
                        as="template">
                        <li :class="[
                            active ? 'bg-blue-100/50 text-blue-500' : 'text-slate-800',
                            'relative cursor-default select-none py-2 pl-10 pr-4',
                        ]">
                            <span :class="[
                                selected ? 'font-medium' : 'font-normal',
                                'block truncate',
                            ]">{{ item.text }}</span>
                            <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
                                <CheckIcon class="h-5 w-5" aria-hidden="true" />
                            </span>
                        </li>
                    </ListboxOption>
                </ListboxOptions>
            </transition>
        </div>
    </Listbox>
</template>
  

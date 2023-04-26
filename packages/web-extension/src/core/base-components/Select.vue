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
        <div class="gij-relative gij-z-10">
            <ListboxButton
                class="gij-relative gij-w-full gij-rounded-lg gij-bg-gray-300/10 gij-py-1 gij-pl-3 gij-pr-10 gij-text-left gij-text-xs gij-text-slate-400 gij-shadow-inner">
                <span class="gij-block gij-truncate">{{ selected.text }}</span>
                <span
                    class="gij-pointer-events-none gij-absolute gij-inset-y-0 gij-right-0 gij-flex gij-items-center gij-pr-2">
                    <ChevronUpDownIcon class="gij-h-4 gij-w-4 gij-text-slate-400" aria-hidden="true" />
                </span>
            </ListboxButton>

            <transition leave-active-class="gij-transition gij-duration-100 gij-ease-in" leave-from-class="gij-opacity-100"
                leave-to-class="gij-opacity-0">
                <ListboxOptions
                    class="gij-absolute gij-mt-1 gij-max-h-60 gij-w-full gij-overflow-auto gij-rounded-md gij-bg-white gij-py-1 gij-shadow-lg gij-ring-1 gij-ring-black gij-ring-opacity-5 focus:gij-outline-none gij-text-xs">
                    <ListboxOption v-slot="{ active, selected }" v-for="item in items" :key="item.key" :value="item"
                        as="template">
                        <li :class="[
                                active ? 'gij-bg-blue-100/50 gij-text-blue-500' : 'gij-text-slate-800',
                                'gij-relative gij-cursor-default gij-select-none gij-py-2 gij-pl-10 gij-pr-4',
                            ]">
                            <span :class="[
                                    selected ? 'gij-font-medium' : 'gij-font-normal',
                                    'gij-block gij-truncate',
                                ]">{{ item.text }}</span>
                            <span v-if="selected"
                                class="gij-absolute gij-inset-y-0 gij-left-0 gij-flex gij-items-center gij-pl-3 gij-text-blue-500">
                                <CheckIcon class="gij-h-5 gij-w-5" aria-hidden="true" />
                            </span>
                        </li>
                    </ListboxOption>
                </ListboxOptions>
            </transition>
        </div>
    </Listbox>
</template>
  

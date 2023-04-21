    
<script setup lang="ts">
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild,
    DialogDescription
} from '@headlessui/vue'
import { XCircleIcon } from '@heroicons/vue/20/solid'
const emit = defineEmits<{
    (e: "close"): void
}>()

const { title } = defineProps<{
    title?: string,
    description?: string
}>()

</script>

<template>
    <TransitionRoot appear as="template">
        <Dialog as="div" @close="emit('close')" class="relative z-[999] ">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
                leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black bg-opacity-25" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4 text-center">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel
                            class="transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all w-[560px] max-w-full">
                            <XCircleIcon
                                class="h-6 w-6 text-slate-300 hover:text-slate-400 absolute right-2 top-2 cursor-pointer"
                                @click="emit('close')" />

                            <DialogTitle as="h3" class="text-lg font-medium leading-6 text-slate-800 mb-2" v-if="title">
                                {{ title }}
                            </DialogTitle>

                            <DialogDescription v-if="description" class="text-sm text-slate-400 mb-2">
                                {{ description }}
                            </DialogDescription>
                            <slot></slot>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

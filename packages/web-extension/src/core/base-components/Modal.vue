    
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
    customPanel?: boolean
    panelClass?: string
}>()

</script>

<template>
    <TransitionRoot appear as="template">
        <Dialog as="div" @close="emit('close')" class="gij-relative gij-z-[999] modal" :initialFocus="null">
            <TransitionChild as="template" enter="gij-duration-300 gij-ease-out" enter-from="gij-opacity-0"
                enter-to="gij-opacity-100" leave="gij-duration-200 gij-ease-in" leave-from="gij-opacity-100"
                leave-to="opacity-0">
                <div class="gij-fixed gij-inset-0 gij-bg-black gij-bg-opacity-mask" />
            </TransitionChild>

            <div class="gij-fixed gij-inset-0 gij-overflow-y-auto">
                <div class="gij-flex gij-min-h-screen gij-items-center gij-justify-center gij-p-4 gij-text-center">
                    <TransitionChild as="template" enter="gij-duration-300 gij-ease-out"
                        enter-from="gij-opacity-0 gij-scale-95" enter-to="gij-opacity-100 gij-scale-100"
                        leave="gij-duration-200 gij-ease-in" leave-from="gij-opacity-100 gij-scale-100"
                        leave-to="gij-opacity-0 gij-scale-95">
                        <DialogPanel v-if="customPanel" :class="['gij-p-6 gij-w-10/12', panelClass]">
                            <slot></slot>
                        </DialogPanel>
                        <DialogPanel v-else
                            :class="['gij-transform gij-overflow-hidden gij-rounded-2xl gij-bg-layer-bg gij-p-6 gij-text-left gij-align-middle gij-shadow-xl gij-transition-all gij-w-[560px] gij-max-w-full gij-relative gij-max-h-[calc(100vh-2rem)] gij-overflow-y-auto', panelClass]">
                            <XCircleIcon
                                class="gij-h-6 gij-w-6 gij-text-main-text/70 hover:gij-text-main-text/75 gij-absolute gij-right-2 gij-top-2 gij-cursor-pointer"
                                @click="emit('close')" />

                            <DialogTitle as="h3"
                                class="gij-text-lg gij-font-medium gij-leading-6 gij-text-main-text/80 gij-mb-2"
                                v-if="title">
                                {{ title }}
                            </DialogTitle>

                            <DialogDescription v-if="description" class="gij-text-sm gij-text-main-text/60 gij-mb-2">
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


<style>
@import url("@/gij-style.css");

.modal * {
    box-sizing: border-box;
}
</style>
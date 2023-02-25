<script lang='ts' setup>
import { ref } from 'vue';

const HANDLER_WIDTH = 24;

interface SlideItem {
    title: string,
    category: string,
    figure: string,
    link: string
}

const { items } = defineProps<{
    items: SlideItem[]
}>()
const activeIndex = ref<number>(items.length - 1);


</script>
<template>
    <div class="relative h-72 overflow-hidden">
        <div v-for="({ category, title, figure, link }, i) of items"
            class="absolute h-full bg-transparent transition-transform" :style="{
                width: `calc(100% - ${i * HANDLER_WIDTH}px)`,
                left: `${i * HANDLER_WIDTH}px`,
                transform: activeIndex < i ? `translateX(calc(100% - ${(items.length - i) * HANDLER_WIDTH}px))` : `translateX(0)`
            }">
            <div class="relative h-full">
                <div class="absolute bg-white px-2 py-3 rounded-l-md border border-r-0 shadow-sm cursor-pointer text-xs text-slate-400 hover:font-semibold"
                    :class="[activeIndex === i ? `font-medium text-slate-600` : `font-light`]" :style="{
                        width: `${HANDLER_WIDTH + 4}px`
                    }" @click="activeIndex = i">
                    {{ category }}
                </div>
                <div class=" h-full bg-slate-100 shadow-sm rounded-md rounded-tl-none overflow-hidden"
                    :style="{ marginLeft: `${HANDLER_WIDTH + 4}px` }">
                    <a :href="link" target="_blank">
                        <img :src="figure" class="w-full h-full" :alt="title" />
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
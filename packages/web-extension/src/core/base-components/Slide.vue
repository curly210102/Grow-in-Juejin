<script lang='ts' setup>
import { computed, ref, watch } from 'vue';
import { IActivity } from '../types';

const HANDLER_WIDTH = 24;

const props = defineProps<{
    items: IActivity[]
}>()

const items = computed(() => {
    return props.items.reverse();
})

const activeIndex = ref<number>(items.value.length - 1);


watch(items, (v) => {
    if (activeIndex.value < 0 || activeIndex.value >= v.length) {
        activeIndex.value = v.length - 1;
    }
})


</script>
<template>
    <div class="relative h-72 overflow-hidden">
        <div v-for="({ category, title, figure, docLink, desc }, i) of items"
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
                    <a :href="docLink" target="_blank" class="block h-full">
                        <img :src="figure" class="w-full h-full" :alt="title" v-if="figure" />
                        <div v-else
                            class="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent  flex items-center flex-col justify-center h-full p-4 space-y-4">
                            <h1 class="font-bold text-4xl whitespace-pre-wrap text-transparent leading-none">{{ title }}
                            </h1>
                            <p class="bg-clip-content">
                                {{ desc }}
                            </p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
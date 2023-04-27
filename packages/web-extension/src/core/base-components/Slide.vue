<script lang='ts' setup>
import { computed, ref, watch } from 'vue';

interface ISlideItem {
    figure?: string;
    title: string;
    docLink: string;
    desc?: string;
    category: string;
}

const HANDLER_WIDTH = 24;

const props = defineProps<{
    items: ISlideItem[]
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
    <div class="gij-relative gij-h-[288px] gij-overflow-hidden">
        <div v-for="({ category, title, figure, docLink, desc }, i) of items"
            class="gij-absolute gij-h-full gij-bg-transparent gij-transition-transform" :style="{
                    width: `calc(100% - ${i * HANDLER_WIDTH}px)`,
                    left: `${i * HANDLER_WIDTH}px`,
                    transform: activeIndex < i ? `translateX(calc(100% - ${(items.length - i) * HANDLER_WIDTH}px))` : `translateX(0)`
                }">
            <div class="gij-relative gij-h-full">
                <div class="gij-absolute gij-bg-white gij-px-[8px] gij-py-3 gij-rounded-l-md gij-border gij-border-r-0 gij-shadow-sm gij-cursor-pointer gij-text-[12px] gij-text-slate-400 hover:gij-font-semibold gij-box-border gij-border-solid gij-border-gray-200"
                    :class="[activeIndex === i ? `gij-font-medium gij-text-slate-600` : `gij-font-light`]" :style="{
                            width: `${HANDLER_WIDTH + 4}px`
                        }" @click="activeIndex = i">
                    {{ category }}
                </div>
                <div class="gij- gij-h-full gij-bg-slate-100 gij-border-2 gij-rounded-md gij-rounded-tl-none gij-overflow-hidden"
                    :style="{ marginLeft: `${HANDLER_WIDTH + 4}px` }">
                    <a :href="docLink" target="_blank" class="gij-block gij-h-full">
                        <img :src="figure" class="gij-w-full gij-h-full" :alt="title" v-if="figure" />
                        <div v-else
                            class="gij-bg-gradient-to-r gij-from-cyan-500 gij-to-blue-500 gij-bg-clip-text gij-text-transparent gij- gij-flex gij-items-center gij-flex-col gij-justify-center gij-h-full gij-p-4 gij-space-y-4">
                            <h1
                                class="gij-font-bold gij-text-4xl gij-whitespace-pre-wrap gij-text-transparent gij-leading-none">
                                {{ title }}
                            </h1>
                            <p class="gij-bg-clip-content">
                                {{ desc }}
                            </p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
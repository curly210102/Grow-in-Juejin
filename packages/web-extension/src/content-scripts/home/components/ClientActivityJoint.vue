<script lang='ts' setup>
import { IArticle, IArticleActivity, IArticleContentItem, IPin, IPinActivity, StorageKey } from '@/core/types';
import { computed, provide, readonly, ref, toRefs, watch } from 'vue';
import Modal from "@/core/base-components/Modal.vue"
import ActivityJoined from '@/core/components/ActivityJoined.vue';
import { loadLocalStorage } from '@/core/utils/storage';
import { articleContentInjectionKey, articleListInjectionKey, pinListInjectionKey, pinTopicInjectionKey } from '@/core/utils/injectionKeys';
import { extCode } from '@/constant';
import initUserPins from '@/core/clientRequests/initUserPins';
import initUserArticles from '@/core/clientRequests/initUserArticles';

const open = ref(false);

const props = defineProps<{
    activities: IArticleActivity[]
    pinActivities: IPinActivity[]
}>()

const { activities, pinActivities } = toRefs(props);

const articleList = ref<IArticle[]>([]);
const articleContent = ref<Map<string, IArticleContentItem>>(new Map());
const pinList = ref<IPin[]>([]);
const userId = ref("");
const topicsRef = ref<Record<string, string>>({});

chrome.runtime.sendMessage({
    to: "Grow in Juejin Background",
    code: extCode,
    content: "requestTopics",
}).then(data => topicsRef.value = data)

loadLocalStorage([StorageKey.PIN_LIST, StorageKey.ARTICLE_LIST, StorageKey.ARTICLE_CONTENTS, StorageKey.USER]).then(data => {
    userId.value = data[StorageKey.USER]?.userId;
    articleList.value = data[StorageKey.ARTICLE_LIST]?.[userId.value] ?? [];
    articleContent.value = new Map(data[StorageKey.ARTICLE_CONTENTS]?.[userId.value] ?? []);
    pinList.value = data[StorageKey.PIN_LIST] ?? [];
})

chrome.storage.local.onChanged.addListener((changes) => {
    if (changes[StorageKey.USER]) {
        userId.value = changes[StorageKey.USER].newValue?.userId;
    }
    if (changes[StorageKey.ARTICLE_LIST]) {
        articleList.value = changes[StorageKey.ARTICLE_LIST].newValue?.[userId.value] ?? [];
    }
    if (changes[StorageKey.ARTICLE_CONTENTS]) {
        articleContent.value = new Map(changes[StorageKey.ARTICLE_CONTENTS].newValue?.[userId.value] ?? []);
    }
    if (changes[StorageKey.PIN_LIST]) {
        pinList.value = changes[StorageKey.PIN_LIST].newValue ?? [];
    }
})

provide(pinTopicInjectionKey, readonly(topicsRef));
provide(articleListInjectionKey, readonly(articleList));
provide(articleContentInjectionKey, readonly(articleContent));
provide(pinListInjectionKey, readonly(pinList));


const earliestPinActivityTime = computed(() => Math.min(...pinActivities.value.map(a => a.startTimeStamp ?? Infinity)))
watch([userId, earliestPinActivityTime, open], (value, oldValue) => {
    if (value[0] !== oldValue[0] || value[1] !== oldValue[1] || value[2] !== oldValue[2]) {
        if (value[0] && value[1] !== Infinity && value[2]) {
            initUserPins(value[0], value[1]);
        }
    }
}, {
    immediate: true
})

const earliestArticleActivityTime = computed(() => Math.min(...activities.value.map(a => a.startTimeStamp ?? Infinity)))
watch([userId, earliestArticleActivityTime, open], (value, oldValue) => {
    if (value[0] !== oldValue[0] || value[1] !== oldValue[1] || value[2] !== oldValue[2]) {
        if (value[0] && value[1] !== Infinity && value[2]) {
            initUserArticles(value[0], value[1]);
        }
    }
}, {
    immediate: true
})





</script>
<template>
    <template v-if="userId">
        <Modal :show="open" @close="open = false" panel-class="!gij-w-[712px] !gij-p-12">
            <ActivityJoined :hide-title="true" :activities="activities" :pinActivities="pinActivities" />
        </Modal>
        <div :class="['gij-bg-layer-bg gij-px-3 gij-py-3 gij-pr-7 gij-font-medium gij-rounded-l-[4px] gij-border-l-2 gij-border-r-0 gij-cursor-pointer gij-box-border hover:gij-translate-x-0 gij-transition-transform gij-border-l-[#ffac0c]', open ? 'gij-translate-x-0 gij-text-main-text' : 'gij-translate-x-2 gij-text-main-text/80', $attrs.class]"
            :style="['writing-mode:vertical-lr;text-orientation:upright;letter-spacing:0.2em;box-shadow:0 2px 8px rgba(50,50,50,.04);']"
            @click="open = true">
            我的活动进度
        </div>
    </template>
</template>


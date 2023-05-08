<script lang='ts' setup>
import { IArticle, IArticleActivity, IArticleContentItem, IPin, IPinActivity, StorageKey } from '@/core/types';
import ClientActivityJointCe from './ClientActivityJoint.vue';
import ClientActivityOngoingCe from './ClientActivityOngoing.vue';

import { IActivityInjectContentType, articleContentInjectionKey, articleListInjectionKey, pinListInjectionKey, pinTopicInjectionKey } from '@/core/utils/injectionKeys';
import { loadLocalStorage } from '@/core/utils/storage';
import { Ref, computed, provide, readonly, ref, watchEffect } from 'vue';
import { extCode } from '@/constant';
import initUserPins from '@/core/clientRequests/initUserPins';
import initUserArticles from '@/core/clientRequests/initUserArticles';
import initUserProfile from '@/core/clientRequests/initUserProfile';

const activitiesRef: Ref<IActivityInjectContentType> = ref({
    article: [],
    pin: [],
    other: []
})
const topicsRef = ref<Record<string, string>>({});
const articleList = ref<IArticle[]>([]);
const articleContent = ref<Map<string, IArticleContentItem>>(new Map());
const pinList = ref<IPin[]>([]);
const userId = ref("");


chrome.runtime.sendMessage({
    to: "Grow in Juejin Background",
    code: extCode,
    content: "requestAllActivities",
}).then((data) => {
    activitiesRef.value = data;
})

chrome.runtime.sendMessage({
    to: "Grow in Juejin Background",
    code: extCode,
    content: "requestTopics",
}).then(data => topicsRef.value = data)

initUserProfile()


loadLocalStorage([StorageKey.PIN_LIST, StorageKey.ARTICLE_LIST, StorageKey.ARTICLE_CONTENTS, StorageKey.USER]).then(data => {
    userId.value = data[StorageKey.USER]?.userId;
    articleList.value = data[StorageKey.ARTICLE_LIST]?.[userId.value] ?? [];
    articleContent.value = new Map(Object.entries(data[StorageKey.ARTICLE_CONTENTS]?.[userId.value] ?? []));
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

const allActivities = computed(() => [...activitiesRef.value.article, ...activitiesRef.value.pin, ...activitiesRef.value.other])

const earliestPinActivityTime = computed(() => Math.min(...activitiesRef.value.pin.map(a => a.startTimeStamp ?? Infinity)))
watchEffect(() => {
    if (userId.value) {
        initUserPins(userId.value, earliestPinActivityTime.value);
    }
})

const earliestArticleActivityTime = computed(() => Math.min(...activitiesRef.value.article.map(a => a.startTimeStamp ?? Infinity)))

watchEffect(() => {
    if (userId.value) {
        initUserArticles(userId.value, earliestArticleActivityTime.value);
    }
})

</script>
<template>
    <ClientActivityOngoingCe :activities="allActivities"></ClientActivityOngoingCe>
    <ClientActivityJointCe :user-id="userId" :activities="activitiesRef.article" :pin-activities="activitiesRef.pin"
        class="gij-mt-[12px]">
    </ClientActivityJointCe>
</template>

<style>
@import url("@/style.css");
</style>
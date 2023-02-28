<script lang='ts' setup>
import useFetchActivities from '@/core/composables/useFetchActivities';
import { IArticle, IArticleContentItem, StorageKey } from '@/core/types';
import { activityInjectionKey, articleInjectionKey, userInjectionKey } from '@/core/utils/injectionKeys';
import { loadLocalStorage } from '@/core/utils/storage';
import { inject, onMounted, provide, ref, unref, watchEffect, readonly } from 'vue';
import { extCode, frameURL } from "../constant"


const frame = ref<HTMLIFrameElement | null>(null);
const userId = inject(userInjectionKey, ref(""));
const tabId = ref();

const activities = useFetchActivities()
const articles = ref<{
    list: IArticle[],
    contentMap: Map<string, IArticleContentItem>
}>({
    list: [],
    contentMap: new Map()
})

loadLocalStorage(StorageKey.ARTICLES).then(data => {
    if (data) {
        articles.value = {
            list: data.list,
            contentMap: new Map(Object.entries(data.contents))
        }
    }
})

onMounted(() => {
    chrome.runtime.onMessage.addListener(function (message, sender) {
        if (message.to === "Grow in Juejin" && message.code === extCode && message.content === "Ready") {
            tabId.value = sender.tab?.id
        }
    });

    chrome.storage.local.onChanged.addListener((changes) => {
        if (changes["article"]) {
            const current = changes["article"].newValue
            articles.value = {
                list: current.list,
                contentMap: new Map(Object.entries(current.contents))
            }
        }
    })
})

watchEffect(() => {
    const earliestStartTime = Math.min(...unref(activities).map(a => a.startTimeStamp ?? Infinity));

    if (tabId.value) {
        chrome.tabs.sendMessage(tabId.value, {
            action: "sync",
            userId: userId.value,
            earliestTime: earliestStartTime
        })
    }
})


provide(activityInjectionKey, readonly(activities));
provide(articleInjectionKey, readonly(articles));


</script>
<template>
    <iframe :src="frameURL" ref="frame" class="w-0 h-0 hidden"></iframe>
    <slot></slot>
</template>
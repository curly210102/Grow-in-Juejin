<script lang='ts' setup>
import useFetchActivities from '@/core/composables/useFetchActivities';
import { IArticle, IArticleContentItem, StorageKey } from '@/core/types';
import { activityInjectionKey, articleInjectionKey, defaultSyncInjectContent, ISyncInjectContentType, syncInjectionKey, userInjectionKey } from '@/core/utils/injectionKeys';
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

const syncBoardCast = inject<ISyncInjectContentType>(syncInjectionKey, defaultSyncInjectContent);


loadLocalStorage(StorageKey.ARTICLES).then(data => {
    if (data) {
        articles.value = {
            list: data.list,
            contentMap: new Map(Object.entries(data.contents))
        }
    }
})

onMounted(() => {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.to === "Grow in Juejin" && message.code === extCode) {
            if (message.content === "Ready") {
                tabId.value = sender.tab?.id
            } else if (message.content === "Sync") {
                const syncId = syncBoardCast.startSyncWithStringId();
                sendResponse(syncId);
            } else if (message.content === "CompleteSync") {
                console.log(message.syncId)
                syncBoardCast.completeSync(message.syncId)
            }
        }
    });

    chrome.storage.local.onChanged.addListener((changes) => {
        if (changes[StorageKey.ARTICLES]) {
            const current = changes[StorageKey.ARTICLES].newValue
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
    <iframe :src="frameURL" ref="frame" class="w-0 h-0 hidden" sandbox="allow-scripts allow-same-origin"></iframe>
    <slot></slot>
</template>
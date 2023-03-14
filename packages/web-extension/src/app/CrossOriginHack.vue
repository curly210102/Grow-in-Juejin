<script lang='ts' setup>
import useFetchActivities from '@/core/composables/useFetchActivities';
import { IArticle, IArticleContentItem, StorageKey } from '@/core/types';
import { activityInjectionKey, articleContentInjectionKey, articleListInjectionKey, defaultSyncInjectContent, ISyncInjectContentType, syncInjectionKey, userInjectionKey } from '@/core/utils/injectionKeys';
import { loadLocalStorage } from '@/core/utils/storage';
import { inject, onMounted, provide, ref, unref, watchEffect, readonly } from 'vue';
import { extCode, frameURL } from "../constant"


const frame = ref<HTMLIFrameElement | null>(null);
const userId = inject(userInjectionKey, ref(""));
const tabId = ref();

const activities = useFetchActivities()
const articleList = ref<IArticle[]>([]);
const articleContent = ref<Map<string, IArticleContentItem>>(new Map());

const syncBoardCast = inject<ISyncInjectContentType>(syncInjectionKey, defaultSyncInjectContent);


loadLocalStorage([StorageKey.ARTICLE_LIST, StorageKey.ARTICLE_CONTENTS]).then(data => {
    if (data) {
        articleList.value = data[StorageKey.ARTICLE_LIST]?.[userId.value] ?? [];
        articleContent.value = new Map(Object.entries(data[StorageKey.ARTICLE_CONTENTS]?.[userId.value] ?? []));
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
                syncBoardCast.completeSync(message.syncId)
            }
        }
    });

    chrome.storage.local.onChanged.addListener((changes) => {
        if (changes[StorageKey.ARTICLE_LIST]) {
            articleList.value = changes[StorageKey.ARTICLE_LIST].newValue?.[userId.value] ?? [];
        }
        if (changes[StorageKey.ARTICLE_CONTENTS]) {
            articleContent.value = new Map(Object.entries(changes[StorageKey.ARTICLE_CONTENTS].newValue?.[userId.value] ?? []));
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
provide(articleListInjectionKey, readonly(articleList));
provide(articleContentInjectionKey, readonly(articleContent));


</script>
<template>
    <iframe :src="frameURL" ref="frame" class="w-0 h-0 hidden" sandbox="allow-scripts allow-same-origin"></iframe>
    <slot></slot>
</template>
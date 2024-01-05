<script lang="ts" setup>
import { IArticle, IArticleContentItem, IPin, StorageKey } from "@/core/types";
import {
    activityInjectionKey,
    articleContentInjectionKey,
    pinListInjectionKey,
    articleListInjectionKey,
    defaultSyncInjectContent,
    ISyncInjectContentType,
    pinTopicIdInjectionKey,
    syncInjectionKey,
    userInjectionKey,
} from "@/core/utils/injectionKeys";
import { loadLocalStorage } from "@/core/utils/storage";
import {
    inject,
    onMounted,
    provide,
    ref,
    unref,
    watchEffect,
    readonly,
    computed,
} from "vue";
import { extCode, frameURL } from "../constant";
import { initTopicIds } from "@/core/clientRequests/initTopics";
import useFetchAllActivities from "@/core/composables/useFetchAllActivities";

const frame = ref<HTMLIFrameElement | null>(null);
const userId = inject(userInjectionKey, ref(""));
const tabId = ref();

const activities = useFetchAllActivities();
const articleList = ref<IArticle[]>([]);
const articleContent = ref<Map<string, IArticleContentItem>>(new Map());
const pinList = ref<IPin[]>([]);
const topics = ref<Record<string, string>>({});

const syncBoardCast = inject<ISyncInjectContentType>(
    syncInjectionKey,
    defaultSyncInjectContent
);

initTopicIds().then((v) => (topics.value = v));

loadLocalStorage([
    StorageKey.ARTICLE_LIST,
    StorageKey.ARTICLE_CONTENTS,
    StorageKey.PIN_LIST,
]).then((data) => {
    if (data) {
        articleList.value = data[StorageKey.ARTICLE_LIST]?.[userId.value] ?? [];
        articleContent.value = new Map(
            data[StorageKey.ARTICLE_CONTENTS]?.[userId.value] ?? []
        );
        pinList.value = data[StorageKey.PIN_LIST] ?? [];
    }
});

onMounted(() => {
    chrome.runtime.onMessage.addListener(function (
        message,
        sender,
        sendResponse
    ) {
        if (message.to === "Grow in Juejin" && message.code === extCode) {
            if (message.content === "Ready") {
                tabId.value = sender.tab?.id;
            } else if (message.content === "Sync") {
                const syncId = syncBoardCast.startSyncWithStringId();
                sendResponse(syncId);
            } else if (message.content === "CompleteSync") {
                syncBoardCast.completeSync(message.syncId);
            }
        }
    });

    chrome.storage.local.onChanged.addListener((changes) => {
        if (changes[StorageKey.ARTICLE_LIST]) {
            articleList.value =
                changes[StorageKey.ARTICLE_LIST].newValue?.[userId.value] ?? [];
        }
        if (changes[StorageKey.ARTICLE_CONTENTS]) {
            articleContent.value = new Map(
                changes[StorageKey.ARTICLE_CONTENTS].newValue?.[userId.value] ?? []
            );
        }
        if (changes[StorageKey.PIN_LIST]) {
            pinList.value = changes[StorageKey.PIN_LIST].newValue ?? [];
        }
    });
});

const earliestPinActivityTime = computed(() =>
    Math.min(...unref(activities.pin).map((a) => a.startTimeStamp ?? Infinity))
);
watchEffect(() => {
    if (tabId.value) {
        chrome.tabs.sendMessage(tabId.value, {
            action: "syncPinList",
            userId: userId.value,
            earliestPinActivityTime: earliestPinActivityTime.value,
        });
    }
});

const earliestArticleActivityTime = computed(() =>
    Math.min(
        ...unref(activities.article).map((a) => a.startTimeStamp ?? Infinity)
    )
);

watchEffect(() => {
    if (tabId.value) {
        chrome.tabs.sendMessage(tabId.value, {
            action: "sync",
            userId: userId.value,
            earliestArticleActivityTime: earliestArticleActivityTime.value,
        });
    }
});

provide(activityInjectionKey, readonly(activities));
provide(articleListInjectionKey, readonly(articleList));
provide(articleContentInjectionKey, readonly(articleContent));
provide(pinListInjectionKey, readonly(pinList));
provide(pinTopicIdInjectionKey, readonly(topics));
</script>
<template>
    <iframe :src="frameURL" ref="frame" class="gij-w-0 gij-h-0 gij-hidden"
        sandbox="allow-scripts allow-same-origin"></iframe>
    <slot></slot>
</template>

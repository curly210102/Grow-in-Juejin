<script lang="ts" setup>
import { extCode } from "@/constant";
import { IPin, IPinActivity, StorageKey } from "@/core/types";
import { Ref, computed, provide, readonly, ref, watch } from "vue";
import PinActivityList from "@/core/components/PinActivityList.vue";
import { loadLocalStorage } from "@/core/utils/storage";
import {
    pinListInjectionKey,
    pinTopicInjectionKey,
} from "@/core/utils/injectionKeys";
import initUserPins from "@/core/clientRequests/initUserPins";

const { userId } = defineProps<{
    userId: string;
}>();

const activitiesRef: Ref<IPinActivity[]> = ref([]);

chrome.runtime
    .sendMessage({
        to: "Grow in Juejin Background",
        code: extCode,
        content: "requestPinActivities",
    })
    .then((data) => {
        activitiesRef.value = data;
    });

const topicsRef = ref<Record<string, string>>({});

chrome.runtime
    .sendMessage({
        to: "Grow in Juejin Background",
        code: extCode,
        content: "requestTopics",
    })
    .then((data) => (topicsRef.value = data));

const pinList = ref<IPin[]>([]);

loadLocalStorage([StorageKey.PIN_LIST]).then((data) => {
    pinList.value = data[StorageKey.PIN_LIST] ?? [];
});

chrome.storage.local.onChanged.addListener((changes) => {
    if (changes[StorageKey.PIN_LIST]) {
        pinList.value = changes[StorageKey.PIN_LIST].newValue ?? [];
    }
});

const earliestPinActivityTime = computed(() =>
    Math.min(...activitiesRef.value.map((a) => a.startTimeStamp ?? Infinity))
);
watch(
    earliestPinActivityTime,
    (value, oldValue) => {
        if (value !== oldValue && value !== Infinity) {
            initUserPins(userId, value);
        }
    },
    {
        immediate: true,
    }
);

provide(pinListInjectionKey, readonly(pinList));
provide(pinTopicInjectionKey, readonly(topicsRef));
</script>
<template>
    <div>
        <PinActivityList :activities="activitiesRef"></PinActivityList>
    </div>
</template>

<style>
@import url("@/style.css");
</style>

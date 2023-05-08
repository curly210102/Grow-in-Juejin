<script lang='ts' setup>
import { extCode } from '@/constant';
import { IPinActivity } from '@/core/types';
import { Ref, ref } from 'vue';
import PinActivityList from "@/core/components/PinActivityList.vue"

const { userId } = defineProps<{
    userId: string
}>();

const activitiesRef: Ref<IPinActivity[]> = ref([])

chrome.runtime.sendMessage({
    to: "Grow in Juejin Background",
    code: extCode,
    content: "requestPinActivities",
}).then((data) => {
    activitiesRef.value = data;
})



</script>
<template>
    <div>
        <PinActivityList :activities="activitiesRef" :userId="userId"></PinActivityList>
    </div>
</template>

<style>
@import url("@/style.css");
</style>
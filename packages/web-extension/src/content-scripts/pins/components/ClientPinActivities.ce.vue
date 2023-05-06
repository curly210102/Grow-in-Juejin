<script lang='ts' setup>
import { extCode } from '@/constant';
import { IActivity } from '@/core/types';
import { Ref, computed, ref } from 'vue';
import PinActivityList from "@/core/components/PinActivityList.vue"

const { userId } = defineProps<{
    userId: string
}>();

const activitiesRef: Ref<IActivity[]> = ref([])

chrome.runtime.sendMessage({
    to: "Grow in Juejin Background",
    code: extCode,
    content: "requestActivities",
}).then((data) => {
    activitiesRef.value = data;
})



</script>
<template>
    <div>
        <PinActivityList :activities="activitiesRef"></PinActivityList>
    </div>
</template>

<style>
@import url("@/style.css");
</style>
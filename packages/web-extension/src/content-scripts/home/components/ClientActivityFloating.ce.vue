<script lang='ts' setup>
import ClientActivityJointCe from './ClientActivityJoint.vue';
import ClientActivityOngoingCe from './ClientActivityOngoing.vue';

import { IActivityInjectContentType } from '@/core/utils/injectionKeys';
import { Ref, computed, ref } from 'vue';
import { extCode } from '@/constant';

const activitiesRef: Ref<IActivityInjectContentType> = ref({
    article: [],
    pin: [],
    other: []
})

chrome.runtime.sendMessage({
    to: "Grow in Juejin Background",
    code: extCode,
    content: "requestAllActivities",
}).then((data) => {
    activitiesRef.value = data;
})


const allActivities = computed(() => [...activitiesRef.value.article, ...activitiesRef.value.pin, ...activitiesRef.value.other])

</script>
<template>
    <ClientActivityOngoingCe :activities="allActivities"></ClientActivityOngoingCe>
    <ClientActivityJointCe :activities="activitiesRef.article" :pin-activities="activitiesRef.pin" class="gij-mt-[12px]">
    </ClientActivityJointCe>
</template>

<style>
@import url("@/style.css");
</style>
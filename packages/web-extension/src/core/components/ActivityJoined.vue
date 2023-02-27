<script setup lang="ts">
import { computed } from "vue";
import SectionHeader from "../base-components/SectionHeader.vue"
import { IActivity } from "../types";

const { activities = [] } = defineProps<{
    activities: IActivity[]
}>()

const earliestStartTime = computed(() => {
    return Math.min(...activities.map(a => a.startTimeStamp ?? Infinity))
})


</script>

<template>
    <SectionHeader title="已参与的活动">

    </SectionHeader>
</template>
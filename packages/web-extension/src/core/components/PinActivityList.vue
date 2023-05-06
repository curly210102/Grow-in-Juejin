<script lang='ts' setup>
import { computed } from 'vue';
import { IActivity } from '../types';
import PinActivityItem from './PinActivityItem.vue';

const { activities } = defineProps<{
    activities: IActivity[]
}>()

const pinActivities = computed(() => {
    return activities.filter(a => a.category === "沸点活动").map(({ title, docLink, startTimeStamp, endTimeStamp, rules, rewards }) => {
        return {
            title, docLink, startTimeStamp, endTimeStamp, rules, rewards,
            stat: {
                dayCount: 1,
                messageCount: 2
            }
        }
    })
})



</script>
<template>
    <div class="gij-bg-white gij-card gij-divide-y gij-divide-gray-100">
        <PinActivityItem v-for="activity of pinActivities" :activity="activity" class="gij-py-2"></PinActivityItem>

    </div>
</template>
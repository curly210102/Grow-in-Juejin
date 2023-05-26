<script lang="ts" setup>
import { Ref, computed, inject, ref, toRefs } from "vue";
import { IPinActivityRule, IPin, IPinActivity } from "../types";
import PinActivityItem from "./PinActivityItem.vue";
import { format } from "../utils/date";
import { pinListInjectionKey } from "../utils/injectionKeys";

const props = defineProps<{
    activities: IPinActivity[];
}>();

const { activities } = toRefs(props);


const pinActivities = computed(() => {
    return activities.value
        .sort(
            (a1, a2) => a2.startTimeStamp - a1.startTimeStamp
        )
});


const pinList = inject<Ref<IPin[]>>(pinListInjectionKey, ref([]))

function isFitActivityRule(pin: IPin, rule?: IPinActivityRule) {
    if (!rule) {
        return false;
    }
    const themeFit = !rule.topic || rule.topic.text === pin.theme.trim();
    const topicFit = !rule.theme.length || rule.theme.includes(pin.topic.trim());
    const jcodeFit = !rule.jcode || pin.jcode;
    const contentFit =
        !rule.keywords.length ||
        rule.keywords.some((keyword) => pin.content.includes(keyword));
    return themeFit && topicFit && jcodeFit && contentFit;
}
function findTimeFitRule(pin: IPin, activity: IPinActivity) {
    const timeFit =
        pin.publishTime >= activity.startTimeStamp &&
        pin.publishTime <= activity.endTimeStamp;
    if (!timeFit) {
        return;
    }

    if (activity.rules && activity.rules.length > 1) {
        const timeFitRule = activity.rules.find(
            (rule) =>
                rule.subStartTime &&
                rule.subEndTime &&
                pin.publishTime >= rule.subStartTime &&
                pin.publishTime <= rule.subEndTime
        );
        return timeFitRule;
    } else {
        return activity.rules?.[0];
    }
}


const activityStats = computed(() => {
    const activityStats = Object.fromEntries(
        pinActivities.value.map((a) => [
            a.key,
            {
                dates: new Set<string>(),
                count: 0,
            },
        ])
    );
    pinList.value.forEach((pin) => {
        for (const activity of pinActivities.value) {
            if (isFitActivityRule(pin, findTimeFitRule(pin, activity))) {
                activityStats[activity.key].dates.add(
                    format(pin.publishTime, "YYYY-MM-DD")
                );
                activityStats[activity.key].count++;
                break;
            }
        }
    });

    return Object.fromEntries(
        Object.entries(activityStats).map(([key, stat]) => [
            key,
            {
                dayCount: stat.dates.size,
                messageCount: stat.count,
            },
        ])
    );
});

</script>
<template>
    <div class="gij-bg-white">
        <PinActivityItem v-for="activity of pinActivities" :activity="activity"
            class="gij-py-2 first:gij-pt-0 last:gij-pb-0 gij-border-0 gij-border-t first:gij-border-t-0 gij-border-gray-100 gij-border-solid"
            :activityStat="activityStats[activity.key
            ]"></PinActivityItem>
    </div>
</template>

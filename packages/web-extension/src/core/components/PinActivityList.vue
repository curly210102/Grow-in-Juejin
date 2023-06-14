<script lang="ts" setup>
import { Ref, computed, inject, ref, toRefs } from "vue";
import { IPinActivityRule, IPin, IPinActivity } from "../types";
import PinActivityItem from "./PinActivityItem.vue";
import { format, getCurrent } from "../utils/date";
import { pinListInjectionKey } from "../utils/injectionKeys";

const props = defineProps<{
    activities: IPinActivity[];
}>();

const { activities } = toRefs(props);


const pinActivities = computed(() => {
    const today = getCurrent();
    return activities.value
        .sort(
            (a1, a2) => {
                if (a1.endTimeStamp < today) {
                    return a2.endTimeStamp < today ? a2.endTimeStamp - a1.endTimeStamp : 1;
                }
                if (a1.startTimeStamp > today) {
                    return a2.startTimeStamp > today ? a2.startTimeStamp - a1.startTimeStamp : 1;
                }
                return a2.startTimeStamp - a1.startTimeStamp
            }
        )
});


const pinList = inject<Ref<IPin[]>>(pinListInjectionKey, ref([]))

function calActivityRuleFitWeight(pin: IPin, rule?: IPinActivityRule) {
    if (!rule) {
        return 0;
    }
    // 第一维度：话题和圈子，话题的优先级高于圈子
    // 第二维度（辅助条件）：关键词和代码

    // 1. 话题：活动有话题要求并且符合 +2
    // 2. 圈子： 活动有圈子要求并且符合 +1 
    // 3. 不符合活动的其中一个条件 =0

    let weight = 0;

    if (rule.topic) {
        if (rule.topic.text === pin.theme.trim()) {
            weight += 2;
        } else {
            return 0;
        }
    }

    if (rule.theme.length) {
        if (rule.theme.includes(pin.topic.trim())) {
            weight += 1;
        } else {
            return 0;
        }
    }
    const jcodeFit = !rule.jcode || pin.jcode;
    const contentFit =
        !rule.keywords.length ||
        rule.keywords.some((keyword) => pin.content.includes(keyword));

    if (!jcodeFit || !contentFit) {
        return 0;
    }

    return weight;
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
        const maxWeightAndKey: [number, string] = [0, ""];
        for (const activity of pinActivities.value) {
            const rule = findTimeFitRule(pin, activity);
            const weight = calActivityRuleFitWeight(pin, rule);
            if (weight > maxWeightAndKey[0]) {
                maxWeightAndKey[0] = weight;
                maxWeightAndKey[1] = activity.key;
            }
        }

        if (maxWeightAndKey[0] > 0) {
            const activityKey = maxWeightAndKey[1];
            activityStats[activityKey].dates.add(
                format(pin.publishTime, "YYYY-MM-DD")
            );
            activityStats[activityKey].count++;
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
    <div class="gij-bg-layer-bg">
        <PinActivityItem v-for="activity of pinActivities" :activity="activity"
            class="gij-py-2 first:gij-pt-0 last:gij-pb-0 gij-border-0 gij-border-t first:gij-border-t-0 gij-border-gray-1-2 gij-border-solid"
            :activityStat="activityStats[activity.key
            ]"></PinActivityItem>
    </div>
</template>

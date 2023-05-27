<script lang="ts" setup>
import { computed, inject, ref, toRef } from "vue";
import { IPinActivity } from "../types";
import { diffOfDate, format, getCurrent, isStartOfDay, MS_OF_DAY, startOfDate } from "../utils/date";
import {
    FireIcon,
    NoSymbolIcon,
    CheckCircleIcon,
    ArrowRightCircleIcon,
} from "@heroicons/vue/20/solid";
import Progress from "../base-components/Progress.vue";
import { IPinTopicInjectContentType, pinTopicInjectionKey } from "../utils/injectionKeys";

export type PinActivityStat = {
    dayCount: number,
    messageCount: number
};

const props = defineProps<{
    activity: IPinActivity;
    activityStat: PinActivityStat
}>();

const activityStat = toRef(props, "activityStat");
const { activity } = props;

const topics = inject<IPinTopicInjectContentType>(pinTopicInjectionKey, ref({}));

enum ActivityStatus {
    "COMPLETE",
    "IN_PROGRESS",
    "NOT_START",
}

const activityProgress = computed(() => {
    if (activity.rewards.every(r => r.rewards.length === 0)) {
        return {
            status: activityStat.value["messageCount"] > 0 ? ActivityStatus.COMPLETE : ActivityStatus.NOT_START,
            progress: []
        }
    }

    const progress: Array<{
        currentLevel?: string;
        nextLevel?: string;
        nextCount?: number;
        count: number;
    }> = [];
    activity.rewards.forEach(({ type, rewards }) => {
        const count =
            activityStat.value[type === "days" ? "dayCount" : "messageCount"];
        const nextRewardIndex = rewards.findIndex((reward) => reward.count > count);
        const currentReward =
            nextRewardIndex < 0 ? rewards.slice(-1)[0] : rewards[nextRewardIndex - 1];
        const nextReward = rewards[nextRewardIndex];

        if (currentReward || nextReward) {
            progress.push({
                currentLevel: currentReward?.name,
                nextLevel: nextReward?.name,
                nextCount: nextReward?.count,
                count,
            });
        }
    });

    return {
        status:
            (!progress.length || progress.some((p) => p.count > 0))
                ? progress.some((p) => p.nextLevel)
                    ? ActivityStatus.IN_PROGRESS
                    : ActivityStatus.COMPLETE
                : ActivityStatus.NOT_START,
        progress,
    };
});

const activityRule = computed(() => {
    if (!activity.rules) {
        return null;
    }

    if (activity.rules.length === 1) {
        return activity.rules?.[0];
    }

    return activity.rules.find(
        (rule) => rule.subStartTime <= Date.now() && rule.subEndTime >= Date.now()
    );
});
function calculateCountdown() {
    const today = startOfDate(getCurrent());
    if (today < activity.startTimeStamp) {
        return `距离开始还有${diffOfDate(today, activity.startTimeStamp)}天`
    } else if (today < activity.endTimeStamp) {
        return `距离结束还有${diffOfDate(today, activity.endTimeStamp)}天`
    } else {
        return '已结束'
    }
}
</script>
<template>
    <div>
        <a class="gij-px-2 gij-py-3 hover:gij-bg-blue-50/50 gij-rounded gij-space-y-4 gij-group gij-cursor-pointer gij-block"
            :tabindex="-1" :href="activity.docLink" target="_blank">
            <div class="gij-flex gij-items-center gij-flex-wrap gij-gap-1">
                <CheckCircleIcon v-if="activityProgress.status === ActivityStatus.COMPLETE"
                    class="gij-w-5 gij-h-5 gij-text-emerald-600">
                </CheckCircleIcon>
                <NoSymbolIcon class="gij-w-5 gij-h-5 gij-text-rose-500"
                    v-else-if="activity.endTimeStamp && activity.endTimeStamp <= Date.now()"></NoSymbolIcon>
                <FireIcon class="gij-w-5 gij-h-5 gij-text-amber-400"
                    v-else-if="activityProgress.status === ActivityStatus.IN_PROGRESS">
                </FireIcon>
                <ArrowRightCircleIcon v-else class="gij-w-5 gij-h-5 gij-text-slate-400"></ArrowRightCircleIcon>
                <div class="gij-flex-1 gij-text-sm gij-font-semibold gij-whitespace-nowrap gij-text-ellipsis">
                    {{ activity.title }}
                </div>
                <div class="gij-text-xs gij-font-semibold gij-text-slate-500 gij-group"
                    v-if="activity.startTimeStamp && activity.endTimeStamp">
                    <span class="group-hover:gij-hidden">{{ format(activity.startTimeStamp, "MM/DD") }} -
                        {{
                            format(
                                isStartOfDay(activity.endTimeStamp)
                                    ? activity.endTimeStamp - MS_OF_DAY
                                    : activity.endTimeStamp,
                                "MM/DD"
                            )
                        }}</span>
                    <span class="group-hover:gij-block gij-hidden">
                        {{ calculateCountdown() }}
                    </span>
                </div>
            </div>
            <div v-if="activityRule" class="gij-text-xs gij-text-slate-400 gij-space-y-2">
                <div v-if="activityRule.topic">
                    话题：
                    <a :href="activityRule.topic.link" class="gij-text-blue-500" target="_blank" :tabindex="-1">#{{
                        activityRule.topic.text
                    }}#</a>
                </div>
                <div v-if="activityRule.theme.length" class="gij-inline-flex gij-gap-1 gij-flex-wrap gij-items-center">
                    圈子：
                    <div class="
                        gij-rounded-full gij-text-xs gij-p-[2px] gij-px-2  gij-bg-blue-400 hover:gij-bg-blue-500"
                        v-for="theme of activityRule.theme ">
                        <a :href="`https://juejin.cn/pin/club/${topics[theme]}`" target="_blank" class="!gij-text-white"
                            :tabindex="- 1">
                            {{ theme }}
                        </a>
                    </div>
                </div>
                <div v-if="activityRule.jcode">需要：添加码上掘金代码</div>
                <div v-if="activityRule.subLink">
                    <a :href="activityRule.subLink" target="_blank" :tabindex="- 1">子活动链接</a>
                </div>
            </div>
            <div v-if="activityProgress.progress.length" class="gij-space-y-1 gij-pb-2">
                <div v-for=" progress  in  activityProgress.progress "
                    class="gij-relative gij-space-y-1 gij-text-xs gij-text-slate-500">
                    <div class="gij-flex gij-gap-2 gij-mb-1">
                        <div v-if="progress.currentLevel">
                            {{ progress.currentLevel }} ✅
                        </div>
                        <span class="gij-ml-auto">🎯 {{ progress.nextLevel }}</span>
                    </div>
                    <Progress :steps="Math.min(
                        1,
                        progress.count /
                        Math.max(1, progress.nextCount ?? progress.count)
                    )
                        " type="simple">
                    </Progress>
                    <div class="gij-absolute gij-border gij-border-blue-500 gij-bg-sky-50 gij-text-blue-800 gij-shadow gij-p-1  gij-rounded-full gij-hidden group-hover:gij-block gij-whitespace-nowrap"
                        :style="{
                            left: `${Math.min(
                                1,
                                progress.count /
                                Math.max(1, progress.nextCount ?? progress.count)
                            ) * 100
                                }%`,
                            transform: 'translateX(-50%)'
                        }">
                        {{ progress.count }}/{{ progress.nextCount ?? progress.count }}
                    </div>
                </div>
            </div>
        </a>
    </div>
</template>

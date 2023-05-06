<script lang="ts" setup>
import { computed } from "vue";
import { IActivity } from "../types";
import { format, isStartOfDay, MS_OF_DAY } from "../utils/date";
import { ClockIcon, CheckCircleIcon, ArrowRightCircleIcon } from "@heroicons/vue/20/solid";

export type PinActivityStat = Pick<IActivity, "docLink" | "title" | "startTimeStamp" | "endTimeStamp" | "rules" | "rewards"> & {
    "stat": {
        dayCount: number,
        messageCount: number
    }
}

const { activity } = defineProps<{
    activity: PinActivityStat;
}>();

enum ActivityStatus {
    "COMPLETE",
    "IN_PROGRESS",
    "NOT_START"
}

const activityProgress = computed(
    () => {
        const progress: Array<{
            currentLevel?: string;
            nextLevel?: string,
            nextCount?: number,
            count: number
        }> = [];
        activity.rewards.forEach(({ type, rewards }) => {
            const count = activity['stat'][type === "days" ? "dayCount" : "messageCount"]
            const nextRewardIndex = rewards.findIndex(reward => reward.count > count);
            const currentReward = nextRewardIndex < 0 ? rewards.slice(-1)[0] : rewards[nextRewardIndex - 1];
            const nextReward = rewards[nextRewardIndex];

            if (currentReward || nextReward) {
                progress.push({
                    currentLevel: currentReward?.name,
                    nextLevel: nextReward?.name,
                    nextCount: nextReward?.count,
                    count
                });
            }
        })

        return {
            status: progress.some(p => p.count > 0) ? progress.some(p => p.nextLevel) ? ActivityStatus.IN_PROGRESS : ActivityStatus.COMPLETE : ActivityStatus.NOT_START,
            progress
        }
    }
);

const isGroupActivity = computed(
    () => activity.rules && activity.rules?.length > 1
);

const activityRule = computed(() => activity.rules?.[0])


</script>
<template>
    <div class="gij-p-2 hover:gij-bg-gray-100 gij-rounded gij-space-y-2">
        <div class="gij-flex gij-items-center gij-flex-wrap gij-gap-1">
            <CheckCircleIcon v-if="activityProgress.status === ActivityStatus.COMPLETE"
                class="gij-w-5 gij-h-5 gij-text-emerald-600">
            </CheckCircleIcon>
            <ClockIcon class="gij-w-5 gij-h-5 gij-text-amber-400"
                v-else-if="activityProgress.status === ActivityStatus.IN_PROGRESS">
            </ClockIcon>
            <ArrowRightCircleIcon v-else class="gij-w-5 gij-h-5 gij-text-slate-400"></ArrowRightCircleIcon>
            <div class="gij-flex-1 gij-text-sm gij-font-semibold gij-whitespace-nowrap gij-text-ellipsis"><a
                    :href="activity.docLink" target="_blank" :title="activity.title" :tabindex="-1">{{
                        activity.title
                    }}</a>
            </div>
            <div class="gij-text-xs gij-font-semibold gij-text-slate-500"
                v-if="activity.startTimeStamp && activity.endTimeStamp">
                {{ format(activity.startTimeStamp, "MM/DD") }} - {{ format(isStartOfDay(activity.endTimeStamp) ?
                    activity.endTimeStamp - MS_OF_DAY : activity.endTimeStamp, "MM/DD") }}</div>
        </div>
        <div v-if="activityRule && !isGroupActivity" class="gij-text-xs gij-text-slate-400">
            <div v-if="activityRule.topic">
                话题：
                <a :href="activityRule.topic.link" class="gij-text-blue-500">{{ activityRule.topic.text }}</a>
            </div>
            <div v-if="activityRule.theme">
                圈子：<div class="gij-rounded-full gij-p-2 gij-text-white gij-bg-blue-400" v-for="theme of activityRule.theme">
                    {{ theme }}
                </div>
            </div>
            <div v-if="activityRule.jcode">
                需要：添加码上掘金代码
            </div>
        </div>
        <div v-if="activityProgress.status === ActivityStatus.IN_PROGRESS" class="gij-space-y-1">
            <Progress :steps="Math.min(1, progress.count / Math.max(1, (progress.nextCount ?? progress.count)))"
                v-for="progress in activityProgress.progress" class="gij-space-y-1">
                <div class="gij-flex gij-gap-2 gij-px-1 gij-group">
                    <div class="gij-hidden group-hover:gij-block gij-text-white/90">
                        {{ Math.floor(Math.min(1, progress.count / Math.max(1, (progress.nextCount ?? progress.count))) *
                            100)
                        }}%
                    </div>
                    <div v-if="progress.currentLevel" class="gij-text-white/90 group-hover:gij-hidden">
                        {{ progress.currentLevel }} 🎉
                    </div>
                    <span class="gij-text-slate-800/60 gij-ml-auto">🎯 {{ progress.nextLevel }}</span>
                </div>
            </Progress>
        </div>
    </div>
</template>

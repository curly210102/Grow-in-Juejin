<script lang='ts' setup>
import Progress from '../base-components/Progress.vue';
import { IActivity } from '../types'
import { format } from "../utils/date";

export type ActivityStatus = Pick<IActivity, "key" | "docLink" | "startTimeStamp" | "endTimeStamp" | "desc" | "title"> & {
    view: number,
    digg: number,
    collect: number,
    comment: number,
    dayCount: number,
    articleCount: number,
    rewards: Array<{
        type: "days" | "count"
    } & Partial<{
        currentLevel: string,
        currentTarget: number,
        nextLevel: string,
        nextTarget: number
    }>>
}

const { activity } = defineProps<{ activity: ActivityStatus }>()

console.log(activity)
</script>
<template>
    <div class="p-6 space-y-5 pb-10">
        <div class="flex items-center">
            <div class="flex-1 text-md font-semibold">{{ activity.title }}</div>
            <div class="text-sm font-semibold text-slate-500" v-if="activity.startTimeStamp && activity.endTimeStamp">
                {{ format(activity.startTimeStamp, "MM/DD") }} - {{ format(activity.endTimeStamp, "MM/DD") }}</div>
        </div>
        <div class="flex items-center">
            <div v-for='[count, unit] in [[activity.articleCount, "篇"], [activity.dayCount, "天"]]'
                class="flex-1 text-center text-3xl font-bold font-mono">
                <span>{{ count }}</span>
                <span class="text-slate-400 text-xs">{{ unit }}</span>
            </div>
        </div>
        <div class="space-y-3">
            <div v-for="reward in activity.rewards" class="space-y-1">
                <Progress :steps="0.6">
                    <div class="flex gap-2 px-1">
                        <span v-if="reward.currentLevel" class="text-white/90">{{ reward.currentLevel }} 🎉</span>
                        <span class="text-slate-800/60 ml-auto">🎯 {{ reward.nextLevel }}</span>
                    </div>
                </Progress>
                <div class="text-slate-400 font-light text-right text-xs px-2" v-if="reward.nextTarget">
                    {{ reward.type === "days" ? `更文 ${reward.nextTarget} 天` : `累计投稿 ${reward.nextTarget} 篇` }}
                </div>
            </div>
        </div>
        <div class="flex gap-2 flex-wrap justify-between">
            <div v-for='[label, count] in [["阅读量", activity.view], ["点赞", activity.digg], ["评论量", activity.comment], ["收藏", activity.collect]]'
                class="text-center overflow-hidden">
                <div class="text-xl opacity-90 font-mono  truncate text-ellipsis" :alt="count">
                    {{ count }}
                </div>
                <div class="text-slate-400 text-sm whitespace-nowrap">
                    {{ label }}
                </div>
            </div>
        </div>
    </div>
</template>
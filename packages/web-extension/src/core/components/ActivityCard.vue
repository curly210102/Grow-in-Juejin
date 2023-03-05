<script lang='ts' setup>
import { ref } from 'vue';
import Progress from '../base-components/Progress.vue';
import { IActivity, TypeInvalidSummary } from '../types'
import { format, isStartOfDay, MS_OF_DAY } from "../utils/date";
import ActivityDetectResultModal from "./ActivityDetectResultModal.vue";

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
    }>>,
    invalid: Array<TypeInvalidSummary>
}

const { activity } = defineProps<{ activity: ActivityStatus }>()

const isDetectResultModalOpen = ref<boolean>(false)

function closeDetectResultModalOpen() {
    isDetectResultModalOpen.value = false
}


</script>
<template>
    <div class="p-6 space-y-5 pb-10">
        <div>
            <div class="flex items-center">
                <div class="flex-1 text-md font-semibold"><a :href="activity.docLink" target="_blank">{{ activity.title
                }}</a>
                </div>
                <div class="text-sm font-semibold text-slate-500" v-if="activity.startTimeStamp && activity.endTimeStamp">
                    {{ format(activity.startTimeStamp, "MM/DD") }} - {{ format(isStartOfDay(activity.endTimeStamp) ?
                        activity.endTimeStamp - MS_OF_DAY : activity.endTimeStamp, "MM/DD") }}</div>
            </div>
            <div class="text-xs text-slate-400/60 mt-2">
                {{ activity.desc }}
            </div>
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
                <Progress :steps="Math.min(1, activity.dayCount / Math.max(1, (reward.nextTarget ?? activity.dayCount))) *
                    Math.min(activity.articleCount / Math.max(1, reward.nextTarget ?? activity.articleCount), 1)">
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
        <div v-if="activity.invalid.length" class="text-slate-400 text-xs">
            ⚠️ 检测到有 {{ activity.invalid.length }} 篇文章未参与活动，<a class="text-blue-400 cursor-pointer hover:text-blue-500"
                @click="isDetectResultModalOpen = true">查看</a>
        </div>
        <ActivityDetectResultModal :show="isDetectResultModalOpen" @close="closeDetectResultModalOpen"
            :invalid-summaries="activity.invalid">
        </ActivityDetectResultModal>
    </div>
</template>
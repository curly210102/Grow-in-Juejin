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
        type: "days" | "count",
        count: number
    } & Partial<{
        currentLevel: string,
        currentTarget: number,
        nextLevel: string,
        nextTarget: number,
        categories: string[]
    }>>,
    invalid: Array<TypeInvalidSummary>
}

const { activity } = defineProps<{ activity: ActivityStatus }>()

const isDetectResultModalOpen = ref<boolean>(false)

function closeDetectResultModal() {
    isDetectResultModalOpen.value = false
}

function openDetectResultModal() {
    isDetectResultModalOpen.value = true
}


</script>
<template>
    <div class="gij-p-6 gij-space-y-5 gij-pb-10 gij-flex gij-flex-col gij-justify-between gij-bg-white">
        <div>
            <div class="gij-flex gij-items-center gij-flex-wrap gij-gap-2">
                <div class="gij-flex-1 gij-text-md gij-font-semibold gij-whitespace-nowrap gij-text-ellipsis"><a
                        :href="activity.docLink" target="_blank" :title="activity.title" :tabindex="-1">{{
                            activity.title
                        }}</a>
                </div>
                <div class="gij-text-sm gij-font-semibold gij-text-slate-500"
                    v-if="activity.startTimeStamp && activity.endTimeStamp">
                    {{ format(activity.startTimeStamp, "MM/DD") }} - {{ format(isStartOfDay(activity.endTimeStamp) ?
                        activity.endTimeStamp - MS_OF_DAY : activity.endTimeStamp, "MM/DD") }}</div>
            </div>
            <div class="gij-text-xs gij-text-slate-400/60 gij-mt-2 gij-whitespace-pre-wrap">
                {{ activity.desc }}
            </div>
        </div>

        <div>
            <div class="gij-flex gij-items-center gij-mb-3">
                <div v-for='[count, unit] in [[activity.articleCount, "篇"], [activity.dayCount, "天"]]'
                    class="gij-flex-1 gij-text-center gij-text-3xl gij-font-bold gij-font-mono">
                    <span>{{ count }}</span>
                    <span class="gij-text-slate-400 gij-text-xs">{{ unit }}</span>
                </div>
            </div>
            <div class="gij-space-y-3">
                <div v-for="reward in activity.rewards" class="gij-space-y-1">
                    <Progress :steps="Math.min(1, reward.count / Math.max(1, (reward.nextTarget ?? reward.count)))">
                        <div class="gij-flex gij-gap-2 gij-px-1 gij-group">
                            <div class="gij-hidden group-hover:gij-block gij-text-white/90">
                                {{ Math.floor(Math.min(1, reward.count / Math.max(1, (reward.nextTarget ?? reward.count))) *
                                    100)
                                }}%
                            </div>
                            <div v-if="reward.currentLevel" class="gij-text-white/90 group-hover:gij-hidden">
                                {{ reward.currentLevel }} 🎉
                            </div>
                            <span class="gij-text-slate-800/60 gij-ml-auto">🎯 {{ reward.nextLevel }}</span>
                        </div>
                    </Progress>
                    <div class="gij-text-slate-400 gij-font-light gij-text-right gij-text-xs gij-px-2"
                        v-if="reward.nextTarget">
                        {{ reward.type === "days" ? `更文 ${reward.nextTarget} 天` : `${reward.categories ?
                            reward.categories.join("/") + "领域" : ""}累计投稿 ${reward.nextTarget} 篇` }}
                    </div>
                </div>
            </div>
        </div>
        <div>
            <div class="gij-flex gij-gap-2 gij-flex-wrap gij-justify-between">
                <div v-for='[label, count] in [["阅读量", activity.view], ["点赞", activity.digg], ["评论量", activity.comment], ["收藏", activity.collect]]'
                    class="gij-text-center gij-overflow-hidden">
                    <div class="gij-text-xl gij-opacity-90 gij-font-mono gij- gij-truncate gij-text-ellipsis" :alt="count">
                        {{ count }}
                    </div>
                    <div class="gij-text-slate-400 gij-text-sm gij-whitespace-nowrap">
                        {{ label }}
                    </div>
                </div>
            </div>
            <div v-if="activity.invalid.length" class="gij-text-slate-400 gij-text-xs gij-mt-2">
                ⚠️ 检测到有 {{ activity.invalid.length }} 篇文章未参与活动，<a
                    class="gij-text-blue-400 gij-cursor-pointer hover:gij-text-blue-500"
                    @click="openDetectResultModal">查看</a>
            </div>
        </div>
        <ActivityDetectResultModal :show="isDetectResultModalOpen" @close="closeDetectResultModal"
            :invalid-summaries="activity.invalid">
        </ActivityDetectResultModal>
    </div>
</template>
<script lang='ts' setup>
import { ref } from 'vue';
import Progress from '../base-components/Progress.vue';
import { IArticleActivity, TypeArticleStatusSummaryGroup } from '../types'
import { getCurrent, format, isStartOfDay, MS_OF_DAY, startOfDate, diffOfDate } from "../utils/date";
import ActivityDetectResultModal from "./ActivityDetectResultModal.vue";

export type ActivityStatus = Pick<IArticleActivity, "key" | "docLink" | "startTimeStamp" | "endTimeStamp" | "desc" | "title" | "addition"> & {
    view: number,
    digg: number,
    collect: number,
    comment: number,
    dayCount: number,
    articleCount: number,
    recommendCount: number,
    point?: number,
    rewards: Array<{
        type: "days" | "count",
        count: number,
        recommendCount: number,
    } & Partial<{
        currentLevel: string,
        currentTarget: number,
        nextLevel: string,
        nextTarget: number,
        nextRecommend: number,
        categories: string[]
    }>>,
    articleSummary: TypeArticleStatusSummaryGroup
}

const { activity } = defineProps<{ activity: ActivityStatus }>()

const isDetectResultModalOpen = ref<boolean>(false)

function closeDetectResultModal() {
    isDetectResultModalOpen.value = false
}

function openDetectResultModal() {
    isDetectResultModalOpen.value = true
}

function calculateProgress(reward: ActivityStatus["rewards"][0]) {
    return Math.min(1, reward.count / Math.max(1, (reward.nextTarget ?? reward.count)))
}

function calculateCountdown() {
    const today = startOfDate(getCurrent());
    if (today < activity.startTimeStamp) {
        return `${diffOfDate(today, activity.startTimeStamp)}天后开始`
    } else if (today < activity.endTimeStamp) {
        return `${diffOfDate(today, activity.endTimeStamp)}天后结束`
    } else {
        return '已结束'
    }
}
</script>
<template>
    <div class="gij-p-6 gij-space-y-5 gij-pb-10 gij-flex gij-flex-col gij-justify-between gij-bg-layer-bg gij-group">
        <div>
            <div class="gij-flex gij-items-center gij-flex-wrap gij-gap-2">
                <div class="gij-flex-1 gij-text-md gij-font-semibold gij-whitespace-nowrap gij-text-ellipsis"><a
                        :href="activity.docLink" target="_blank" :title="activity.title" :tabindex="-1"
                        class="gij-text-main-text/90 group-hover:gij-text-primary">{{
                            activity.title
                        }}</a>
                </div>
                <div class="gij-text-sm gij-font-semibold gij-text-main-text/80"
                    v-if="activity.startTimeStamp && activity.endTimeStamp">
                    <span class="group-hover:gij-hidden">{{ format(activity.startTimeStamp, "MM/DD") }} - {{
                        format(isStartOfDay(activity.endTimeStamp) ?
                            activity.endTimeStamp - MS_OF_DAY : activity.endTimeStamp, "MM/DD") }}</span>
                    <span class="gij-hidden group-hover:gij-block">
                        {{
                            calculateCountdown()
                        }}
                    </span>
                </div>
            </div>
            <div class="gij-text-xs gij-text-main-text/75 gij-mt-2 gij-whitespace-pre-wrap">
                {{ activity.desc }}
            </div>
        </div>

        <div>
            <div class="gij-flex gij-items-center gij-mb-3">
                <div v-for='[count, unit] in [[activity.articleCount, "篇"], activity.point ? [activity.point, "积分"] : [activity.dayCount, "天"]]'
                    class="gij-flex-1 gij-text-center gij-text-3xl gij-font-bold gij-font-mono">
                    <span class="gij-text-main-text">{{ count }}</span>{{ " " }}
                    <span class="gij-text-main-text/75 gij-text-xs">{{ unit }}</span>
                </div>
            </div>
            <div class="gij-space-y-3">
                <div v-for="reward in activity.rewards" class="gij-space-y-1">
                    <Progress :steps="calculateProgress(reward)">
                        <div class="gij-flex gij-gap-2 gij-px-1 gij-cursor-pointer">
                            <div
                                :class='["gij-hidden group-hover:gij-block", calculateProgress(reward) < 0.18 ? "gij-text-main-text/70" : "gij-text-white/70"]'>
                                {{ Math.floor(calculateProgress(reward) *
                                    100)
                                }}%
                            </div>
                            <div v-if="reward.currentLevel" class="gij-text-main-text/90 group-hover:gij-hidden">
                                {{ reward.currentLevel }} 🎉
                            </div>
                            <span v-if="reward.nextLevel" class="gij-text-main-text/60 gij-ml-auto">🎯 {{ reward.nextLevel
                            }}</span>
                        </div>
                    </Progress>
                    <div class="gij-text-main-text/60 gij-font-light gij-text-right gij-text-xs gij-px-2"
                        v-if="reward.nextTarget">
                        {{ reward.count >= reward.nextTarget ? "✅ " : "" }}
                        {{ reward.type === "days" ? `更文 ${reward.nextTarget} 天` : `${reward.categories
                            ?
                            reward.categories.join("/") + "领域" : ""}累计投稿 ${reward.nextTarget} 篇` }}
                        <br />{{ reward.nextRecommend ? `${reward.nextRecommend <= reward.recommendCount ? "✅ " : ""}至少
                                                    ${reward.nextRecommend} 篇文章被推荐` : '' }} </div>
                    </div>
                </div>
            </div>
            <div>
                <div class="gij-flex gij-gap-2 gij-flex-wrap gij-justify-between">
                    <div v-for='[label, count] in [["阅读量", activity.view], ["点赞", activity.digg], ["评论量", activity.comment], ["收藏", activity.collect]]'
                        class="gij-text-center gij-overflow-hidden">
                        <div class="gij-text-xl gij-text-main-text gij-font-mono gij- gij-truncate gij-text-ellipsis"
                            :alt="count">
                            {{ count }}
                        </div>
                        <div class="gij-text-main-text/75 gij-text-sm gij-whitespace-nowrap">
                            {{ label }}
                        </div>
                    </div>
                </div>
                <div class="gij-text-main-text/50 gij-text-xs gij-mt-4 gij-space-x-4 gij-flex gij-flex-wrap">
                    <div>
                        <span v-if="activity.articleSummary.invalid.length > 0">🚨 检测到 {{
                            activity.articleSummary["invalid"].length }}
                            篇文章未参与，</span>
                        <span v-else>🔍 </span>
                        <a class="gij-cursor-pointer hover:gij-text-primary-hover active:gij-text-primary-active gij-underline"
                            @click="openDetectResultModal">查看投稿状态</a>
                    </div>
                    <div v-if="activity.addition">
                        <span>🔗 </span>
                        <a class="gij-cursor-pointer hover:gij-text-primary-hover active:gij-text-primary-active gij-underline"
                            target="_blank" :href="activity.addition?.link">{{ activity.addition?.text }}</a>
                    </div>
                </div>

            </div>
            <ActivityDetectResultModal :show="isDetectResultModalOpen" @close="closeDetectResultModal"
                :summaries="activity.articleSummary">
            </ActivityDetectResultModal>
        </div>
</template>
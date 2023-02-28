<script setup lang="ts">
import { computed, inject, ref, Ref, toRef } from "vue";
import SectionHeader from "../base-components/SectionHeader.vue"
import { IActivity, IArticle, IArticleContentItem } from "../types";
import { format } from "../utils/date";
import { articleInjectionKey } from "../utils/injectionKeys";
import ActivityCard, { ActivityStatus } from "./ActivityCard.vue";

const props = defineProps<{
    activities: IActivity[]
}>()

const activities = toRef(props, "activities");

const articles = inject<Ref<{
    list: IArticle[],
    contentMap: Map<string, IArticleContentItem>
}>>(articleInjectionKey, ref({
    list: [],
    contentMap: new Map()
}))


const activityStats = computed(() => {
    const stats = Object.fromEntries(activities.value.map(a => [a.key, {
        view: 0,
        digg: 0,
        collect: 0,
        comment: 0,
        dates: new Set<string>(),
        articleCount: 0
    }]))

    const { list, contentMap } = articles.value;
    list.forEach(({ view_count, tags, collect_count, comment_count, category, digg_count, publishTime, title, verify, id }) => {
        const articleContentInfo = contentMap.get(id);
        if (articleContentInfo) {
            const { count, fragment } = articleContentInfo;
            for (const activity of activities.value) {
                const { signLink, signSlogan, wordCount, startTimeStamp = 0, endTimeStamp = Infinity, categories, tagNames } = activity;
                const signSloganRegexp = new RegExp(signSlogan.replace(/([()[{*+.$^\\|?])/g, '\\$1').replace("N", "\\d+"));
                const signLinkRegexp = new RegExp(`${signLink}((?:\/|$)?)`);

                if (publishTime >= startTimeStamp && publishTime <= endTimeStamp) {
                    // 活动时间范围内
                    const sloganFit = signSloganRegexp.test(fragment);
                    const linkFit = signLinkRegexp.test(fragment);
                    const wordCountFit = count >= wordCount;
                    const categoryFit = categories.includes(category);
                    const tagFit = new Set(tags.filter(tag => tagNames.includes(tag.tag_name)).map(tag => tag.tag_id)).size === tagNames.length;

                    if (sloganFit && linkFit && wordCountFit && categoryFit && tagFit) {
                        const activityStat = stats[activity.key];
                        activityStat.view += view_count;
                        activityStat.digg += digg_count;
                        activityStat.collect += collect_count;
                        activityStat.comment += comment_count;
                        activityStat.articleCount += 1;
                        activityStat.dates.add(format(publishTime, "YYYY-MM-DD"))
                        break;
                    }
                }
            }
        }
    })

    return stats
})

const joinedActivities = computed(() => {
    return activities.value.filter(({ key }) => activityStats.value[key]?.articleCount > 0).map(({
        key,
        title,
        docLink,
        startTimeStamp,
        endTimeStamp,
        desc,
        rewards
    }) => {
        const stat = activityStats.value[key];
        const activityStatus: ActivityStatus = {
            key,
            title,
            docLink,
            startTimeStamp,
            endTimeStamp,
            desc,
            view: stat.view,
            digg: stat.digg,
            collect: stat.collect,
            comment: stat.comment,
            dayCount: stat.dates.size,
            articleCount: stat.articleCount,
            rewards: []
        };

        rewards.forEach(({ type, rewards }) => {
            const compareProperty = type === "days" ? "dayCount" : "articleCount";
            const nextRewardIndex = rewards.findIndex(reward => reward.count > activityStatus[compareProperty]);

            const currentReward = nextRewardIndex < 0 ? rewards.slice(-1)[0] : rewards[nextRewardIndex - 1];
            const nextReward = rewards[nextRewardIndex];

            if (currentReward || nextReward) {
                activityStatus.rewards.push({
                    type,
                    currentLevel: currentReward?.name,
                    currentTarget: currentReward?.count,
                    nextTarget: nextReward?.count,
                    nextLevel: nextReward?.name,
                })
            }
        })
        return activityStatus;
    })
})

</script>

<template>
    <SectionHeader title="已参与的活动">
    </SectionHeader>
    <div class="grid gap-2 grid-cols-2">
        <ActivityCard v-for="activity in joinedActivities" class="card" :activity="activity">
        </ActivityCard>
    </div>
</template>
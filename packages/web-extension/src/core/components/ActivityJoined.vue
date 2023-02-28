<script setup lang="ts">
import { computed, inject, ref, Ref, toRef, watch } from "vue";
import SectionHeader from "../base-components/SectionHeader.vue"
import { IActivity, IArticle, IArticleContentItem } from "../types";
import { format } from "../utils/date";
import { articleInjectionKey } from "../utils/injectionKeys";

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
        desc
    }) => {
        const stat = activityStats.value[key]
        return {
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
            articleCount: stat.articleCount
        }
    })
})

</script>

<template>
    <SectionHeader title="已参与的活动">
        <div v-for="activity in joinedActivities">

            {{ activity.title }}
            {{ activity.articleCount }}
            {{ activity.dayCount }}
        </div>
    </SectionHeader>
</template>
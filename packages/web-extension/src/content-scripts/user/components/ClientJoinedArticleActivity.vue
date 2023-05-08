<script lang='ts' setup>
import { ArticleContentMap, IArticleActivity, IArticle } from '@/core/types';
import ActivityCard from "@/core/components/ActivityCard.vue"
import useComputeJoinedArticleActivities from '@/core/composables/useComputeJoinedArticleActivities';
import initUserArticles from '@/core/clientRequests/initUserArticles';
import { computed, ref, Ref, watchEffect } from 'vue';
import { extCode } from '@/constant';

const { userId } = defineProps<{
    userId: string
}>();

const activitiesRef: Ref<IArticleActivity[]> = ref([])

chrome.runtime.sendMessage({
    to: "Grow in Juejin Background",
    code: extCode,
    content: "requestArticleActivities"
}).then((data) => {
    activitiesRef.value = data;
})

const articleListRef: Ref<IArticle[]> = ref([]);
const articleContentMapRef: Ref<ArticleContentMap> = ref(new Map());
const earliestStartTime = computed(() => Math.min(...activitiesRef.value.map(a => a.startTimeStamp ?? Infinity)));


watchEffect(async () => {
    if (earliestStartTime.value !== Infinity) {
        const { articleList, articleContentMap } = await initUserArticles(userId, earliestStartTime.value)
        articleListRef.value = articleList;
        articleContentMapRef.value = articleContentMap;
    }
});

const joinedActivities = useComputeJoinedArticleActivities(activitiesRef,
    articleListRef,
    articleContentMapRef);


</script>
<template>
    <div v-if="joinedActivities.length" class="gij-space-y-2">
        <ActivityCard v-for="activity in joinedActivities" :activity="activity" class="juejin-card">
        </ActivityCard>
    </div>
</template>


<script lang='ts' setup>
import { ArticleContentMap, IActivity, IArticle } from '@/core/types';
import ActivityCard from "@/core/components/ActivityCard.vue"
import useComputeJoinedActivities from '@/core/composables/useComputeJoinedActivities';
import initUserArticles from '@/core/clientRequests/initUserArticles';
import { computed, ref, Ref, watchEffect } from 'vue';
import { extCode } from '@/constant';

const { userId } = defineProps<{
    userId: string
}>();

const activitiesRef: Ref<IActivity[]> = ref([])

chrome.runtime.sendMessage({
    to: "Grow in Juejin Background",
    code: extCode,
    content: "requestActivities"
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

const joinedActivities = useComputeJoinedActivities(activitiesRef,
    articleListRef,
    articleContentMapRef);

</script>
<template>
    <div class="juejin-card" v-if="joinedActivities.length">
        <ActivityCard v-for="activity in joinedActivities" :activity="activity">
        </ActivityCard>
    </div>
</template>

<style>
@import url("@/style.css");
</style>
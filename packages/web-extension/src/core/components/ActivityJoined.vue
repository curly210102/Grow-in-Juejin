<script setup lang="ts">
import { inject, ref, toRef } from "vue";
import SectionHeader from "../base-components/SectionHeader.vue"
import useComputeJoinedActivities from "../composables/useComputeJoinedActivities";
import { IActivity } from "../types";
import { articleContentInjectionKey, articleListInjectionKey, IArticleContentInjectContentType, IArticleListInjectContentType } from "../utils/injectionKeys";
import ActivityCard from "./ActivityCard.vue";

const props = defineProps<{
    activities: IActivity[]
}>()

const activities = toRef(props, "activities");


const articleList = inject<IArticleListInjectContentType>(articleListInjectionKey, ref([]))
const articleContentMap = inject<IArticleContentInjectContentType>(articleContentInjectionKey, ref(new Map()))


const joinedActivities = useComputeJoinedActivities(activities, articleList, articleContentMap);

</script>

<template>
    <SectionHeader title="正在参与的活动">
    </SectionHeader>
    <div class="grid gap-2 grid-cols-2" v-if="joinedActivities.length">
        <ActivityCard v-for="activity in joinedActivities" class="card" :activity="activity">
        </ActivityCard>
    </div>
    <div v-else class="border rounded-md border-gray-200/80 bg-gray-100/50 text-slate-400 text-sm text-center p-4">
        <a href="https://github.com/curly210102/grow-in-juejin/issues/new" target="_blank" class="block">
            未检测到正在参与的活动，如有差异请提交
            Issue
        </a>
    </div>
</template>
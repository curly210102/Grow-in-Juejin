<script lang='ts' setup>
import useClientPreferences from '@/content-scripts/useClientPreferences';
import ClientJoinedArticleActivity from './ClientJoinedArticleActivity.vue';
import { computed } from 'vue';
import { PreferenceKey, PreferenceValue } from '@/core/types';


const preferences = useClientPreferences();
const shouldRender = computed(() => (preferences.value[PreferenceKey.ACTIVITIES_OF_MINE] !== PreferenceValue.HIDE))

const { userId } = defineProps<{
    userId: string
}>();


</script>
<template>
    <ClientJoinedArticleActivity v-if="shouldRender" :user-id="userId" />
</template>

<style>
@import url("@/style.css");
</style>
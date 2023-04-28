<script lang='ts' setup>
import useClientPreferences from '@/content-scripts/useClientPreferences';
import ClientJoinedActivity from './ClientJoinedActivity.vue';
import { computed, defineProps } from 'vue';
import { PreferenceKey, PreferenceValue } from '@/core/types';


const preferences = useClientPreferences();
const shouldRender = computed(() => (preferences.value[PreferenceKey.ACTIVITIES_OF_MINE] !== PreferenceValue.HIDE))

const { userId } = defineProps<{
    userId: string
}>();


</script>
<template>
    <ClientJoinedActivity v-if="shouldRender" :user-id="userId" />
</template>

<style>
@import url("@/style.css");
</style>
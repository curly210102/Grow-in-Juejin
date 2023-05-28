<script lang='ts' setup>
import ClientGrowTrending from './ClientGrowTrending.vue';
import { PreferenceKey, PreferenceValue } from '@/core/types';
import { userInjectionKey } from '@/core/utils/injectionKeys';
import { computed, provide, readonly, ref } from 'vue';
import UserContribution from '@/core/components/UserContribution.vue';
import useClientPreferences from '@/content-scripts/useClientPreferences';
import ClientCollapseToggle from './ClientCollapseToggle.vue';
import useThemeProvider from '@/core/composables/useThemeProvider';

const { userId, inMyPage } = defineProps<{
    userId: string,
    inMyPage: boolean
}>();

provide(userInjectionKey, readonly(ref(userId)));

const isContributionCollapsed = ref(true);
const isTrendingCollapsed = ref(true);
const preferences = useClientPreferences();
const pref = computed(() => ({
    contribution: preferences.value[inMyPage ? PreferenceKey.CONTRIBUTION_OF_MINE : PreferenceKey.CONTRIBUTION_OF_OTHERS],
    trending: preferences.value[inMyPage ? PreferenceKey.TRENDING_OF_MINE : PreferenceKey.TRENDING_OF_OTHERS]
}))
useThemeProvider();

</script>
<template>
    <div class="gij-space-y-2">
        <ClientCollapseToggle v-if="pref.contribution === PreferenceValue.COLLAPSE" v-model="isContributionCollapsed">社区活跃度
        </ClientCollapseToggle>
        <UserContribution hideSummation
            v-if="pref.contribution === PreferenceValue.SHOW || (pref.contribution === PreferenceValue.COLLAPSE && !isContributionCollapsed)" />

        <ClientCollapseToggle v-if="pref.trending === PreferenceValue.COLLAPSE" v-model="isTrendingCollapsed">成长趋势
        </ClientCollapseToggle>
        <ClientGrowTrending
            v-if="pref.trending === PreferenceValue.SHOW || (pref.trending === PreferenceValue.COLLAPSE && !isTrendingCollapsed)"
            :userId="userId" />
    </div>
</template>
<style>
@import url("@/style.css");
</style>
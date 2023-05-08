<script lang='ts' setup>
import useClientPreferences from '@/content-scripts/useClientPreferences';
import UserTagRadar from '@/core/components/UserTagRadar.vue';
import { IArticle, StorageKey } from '@/core/types';
import { articleListInjectionKey } from '@/core/utils/injectionKeys';
import { loadLocalStorage } from '@/core/utils/storage';
import { computed, getCurrentInstance, provide, Ref, ref, watch, watchEffect } from 'vue';
import { PreferenceKey, PreferenceValue } from '@/core/types';

const articleList = ref<Ref<IArticle[]>>(ref([]));

const { userId, inMyPage } = defineProps<{
    userId: string,
    inMyPage: boolean
}>();

const preferences = useClientPreferences();
const shouldRender = computed(() => (preferences.value[inMyPage ? PreferenceKey.TAG_RADAR_OF_MINE : PreferenceKey.TAG_RADAR_OF_OTHERS] !== PreferenceValue.HIDE))

loadLocalStorage(StorageKey.ARTICLE_LIST).then(data => {
    articleList.value = data?.[userId] ?? []
})
chrome.storage.local.onChanged.addListener((changes) => {
    if (changes[StorageKey.ARTICLE_LIST]) {
        articleList.value = changes[StorageKey.ARTICLE_LIST].newValue?.[userId] ?? [];
    }
})

watchEffect(() => {

    const parentElement = document.querySelector("gij-tag-radar")?.parentElement;
    if (parentElement) {
        if (shouldRender.value) {
            parentElement.style.display = "block";
        } else {
            parentElement.style.display = "none";
        }
    }

})


provide(articleListInjectionKey, articleList);

</script>
<template>
    <UserTagRadar v-if="shouldRender" />
</template>

<style>
@import url("@/style.css");
</style>
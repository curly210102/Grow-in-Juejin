<script lang='ts' setup>
import { syncArticleList } from '@/core/clientRequests/initUserArticles';
import UserGrowTrending from '@/core/components/UserGrowTrending.vue';
import { IArticle, StorageKey } from '@/core/types';
import { articleListInjectionKey } from '@/core/utils/injectionKeys';
import { loadLocalStorage } from '@/core/utils/storage';
import { provide, Ref, ref } from 'vue';

const { userId, inMyPage } = defineProps<{
    userId: string,
    inMyPage: boolean
}>();
const articleList = ref<Ref<IArticle[]>>(ref([]));

(async () => {
    if (inMyPage) {
        loadLocalStorage(StorageKey.ARTICLE_LIST).then(data => {
            articleList.value = data ?? []
        })
        chrome.storage.local.onChanged.addListener((changes) => {
            if (changes[StorageKey.ARTICLE_LIST]) {
                articleList.value = changes[StorageKey.ARTICLE_LIST].newValue;
            }
        })
    } else {
        articleList.value = await syncArticleList(userId);
    }
})()


provide(articleListInjectionKey, articleList);
</script>
<template>
    <UserGrowTrending />
</template>
<style>
@import url("@/style.css");
</style>
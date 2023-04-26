<script lang='ts' setup>
import { syncArticleList } from '@/core/clientRequests/initUserArticles';
import UserGrowTrending from '@/core/components/UserGrowTrending.vue';
import { IArticle, StorageKey } from '@/core/types';
import { articleListInjectionKey, userInjectionKey } from '@/core/utils/injectionKeys';
import { loadLocalStorage } from '@/core/utils/storage';
import { provide, readonly, Ref, ref } from 'vue';
import UserContribution from '@/core/components/UserContribution.vue';

const { userId, inMyPage } = defineProps<{
    userId: string,
    inMyPage: boolean
}>();
const articleList = ref<Ref<IArticle[]>>(ref([]));

provide(userInjectionKey, readonly(ref(userId)));

(async () => {
    if (inMyPage) {
        loadLocalStorage(StorageKey.ARTICLE_LIST).then(data => {
            articleList.value = data?.[userId] ?? []
        })
        chrome.storage.local.onChanged.addListener((changes) => {
            if (changes[StorageKey.ARTICLE_LIST]) {
                articleList.value = changes[StorageKey.ARTICLE_LIST].newValue?.[userId] ?? [];
            }
        })
    } else {
        articleList.value = await syncArticleList(userId);
    }
})()


provide(articleListInjectionKey, articleList);
</script>
<template>
    <div class="gij-space-y-2">
        <UserContribution hideSummation />
        <UserGrowTrending />
    </div>
</template>
<style>
@import url("@/style.css");
</style>
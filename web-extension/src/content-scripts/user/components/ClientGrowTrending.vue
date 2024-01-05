<script lang='ts' setup>
import UserGrowTrending from '@/core/components/UserGrowTrending.vue';
import { IArticle, StorageKey } from '@/core/types';
import { articleListInjectionKey } from '@/core/utils/injectionKeys';
import { loadLocalStorage } from '@/core/utils/storage';
import { provide, Ref, ref } from 'vue';

const articleList = ref<Ref<IArticle[]>>(ref([]));

const { userId } = defineProps<{
    userId: string,
}>();

loadLocalStorage(StorageKey.ARTICLE_LIST).then(data => {
    articleList.value = data?.[userId] ?? []
})
chrome.storage.local.onChanged.addListener((changes) => {
    if (changes[StorageKey.ARTICLE_LIST]) {
        articleList.value = changes[StorageKey.ARTICLE_LIST].newValue?.[userId] ?? [];
    }
})

provide(articleListInjectionKey, articleList);

</script>
<template>
    <UserGrowTrending />
</template>

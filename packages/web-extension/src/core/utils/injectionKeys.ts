import { readonly, Ref } from "vue";
import { IArticle, IArticleContentItem } from "../types";

export const userInjectionKey = Symbol();
export const activityInjectionKey = Symbol();

export const articleListInjectionKey = Symbol();
export type IArticleListInjectContentType = Ref<IArticle[]>;
export const articleContentInjectionKey = Symbol();
export type IArticleContentInjectContentType = Ref<Map<string, IArticleContentItem>>;

export const syncInjectionKey = Symbol();
export type ISyncInjectContentType = {
    startSyncWithStringId: () => any,
    sync: () => () => void,
    completeSync: (_id: any) => void
}

export const defaultSyncInjectContent: ISyncInjectContentType = readonly({
    sync: () => () => { },
    startSyncWithStringId: () => { },
    completeSync: () => { }
})
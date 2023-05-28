import { readonly, Ref } from "vue";
import { ArticleContentMap, IActivity, IArticle, IArticleActivity, IPinActivity } from "../types";

export const userInjectionKey = Symbol();
export const activityInjectionKey = Symbol();
export type IActivityInjectContentType = {
    article: Array<IArticleActivity>,
    pin: Array<IPinActivity>,
    other: Array<IActivity>
}
export const pinActivityInjectionKey = Symbol();
export const pinTopicInjectionKey = Symbol();
export type IPinTopicInjectContentType = Ref<Record<string, string>>;
export const pinListInjectionKey = Symbol();

export const articleListInjectionKey = Symbol();
export type IArticleListInjectContentType = Ref<IArticle[]>;
export const articleContentInjectionKey = Symbol();
export type IArticleContentInjectContentType = Ref<ArticleContentMap>;

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

export const themeInjectionKey = Symbol();
export type IThemeInjectionContentType = "dark" | "light"
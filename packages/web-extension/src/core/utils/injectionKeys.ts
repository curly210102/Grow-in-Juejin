import { readonly } from "vue";

export const userInjectionKey = Symbol();
export const activityInjectionKey = Symbol();
export const articleInjectionKey = Symbol();
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
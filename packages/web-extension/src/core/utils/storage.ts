import { StorageKey } from "@/types"

export const loadLocalStorage = async (storageKey: StorageKey | StorageKey[]) => {
    const local = (await chrome.storage.local.get(storageKey));
    if (Array.isArray(storageKey)) {
        return local;
    } else {
        return local?.[storageKey];
    }
}


export const saveLocalStorage = async (storageKey: StorageKey, data: any) => {
    await chrome.storage.local.set({
        [storageKey]: data
    })
}

export const batchSaveLocalStorage = async (record: Partial<Record<StorageKey, any>>) => {
    await chrome.storage.local.set(record)
}
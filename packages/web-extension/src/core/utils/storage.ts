import { StorageKey } from "@/types"

export const loadLocalStorage = async (storageKey: StorageKey) => {
    return (await chrome.storage.local.get(storageKey))?.[storageKey];
}

export const saveLocalStorage = async (storageKey: StorageKey, data: any) => {
    await chrome.storage.local.set({
        [storageKey]: data
    })
}
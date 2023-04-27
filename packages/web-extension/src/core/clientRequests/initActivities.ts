import { StorageKey } from "../types";
import { fetchActivities } from "../utils/api";
import { MS_OF_30MIN } from "../utils/date";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";

export default async function () {
    const local = await loadLocalStorage(StorageKey.ACTIVITIES);
    if (local && local.activities && (local.lastUpdateTime && (Date.now() < local.lastUpdateTime + MS_OF_30MIN))) {         
        return local.activities;
    } else {
        const data = await fetchActivities();
        await saveLocalStorage(StorageKey.ACTIVITIES, {
            activities: data,
            lastUpdateTime: Date.now()
        });
        return data;
    }
}
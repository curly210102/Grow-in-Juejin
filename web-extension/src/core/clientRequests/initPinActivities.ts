import { StorageKey } from "../types";
import { fetchPinActivities } from "../utils/api";
import { MS_OF_30MIN } from "../utils/date";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";

export default async function () {
    const local = await loadLocalStorage(StorageKey.PIN_ACTIVITIES);
    if (local && local.activities && (local.lastUpdateTime && (Date.now() < local.lastUpdateTime + MS_OF_30MIN))) {
        return local.activities;
    } else {
        try {
            const data = await fetchPinActivities();
            await saveLocalStorage(StorageKey.PIN_ACTIVITIES, {
                activities: data,
                lastUpdateTime: Date.now()
            });
            return data;
        } catch {
            return local?.activities ?? []
        }
    }
}
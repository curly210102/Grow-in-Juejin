import { StorageKey } from "../types";
import { fetchOtherActivities } from "../utils/api";
import { MS_OF_30MIN } from "../utils/date";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";

export default async function () {
    const local = await loadLocalStorage(StorageKey.OTHER_ACTIVITIES);
    if (local && local.activities && (local.lastUpdateTime && (Date.now() < local.lastUpdateTime + MS_OF_30MIN))) {
        return local.activities;
    } else {
        try {
            const data = await fetchOtherActivities();
            await saveLocalStorage(StorageKey.OTHER_ACTIVITIES, {
                activities: data,
                lastUpdateTime: Date.now()
            });
            return data;
        } catch {
            return local?.activities ?? []
        }
    }
}
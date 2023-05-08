import { StorageKey } from "../types";
import { fetchTopics } from "../utils/api";
import { MS_OF_7DAY } from "../utils/date";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";

export default async function () {
    const local = await loadLocalStorage(StorageKey.TOPICS);
    if (local && local.data && (local.lastUpdateTime && (Date.now() < local.lastUpdateTime + MS_OF_7DAY))) {
        return local.data;
    } else {
        const data = await fetchTopics();
        await saveLocalStorage(StorageKey.TOPICS, {
            data: data,
            lastUpdateTime: Date.now()
        });
        return data;
    }
}
import { StorageKey } from "../types";
import { fetchTopics } from "../utils/api";
import { MS_OF_DAY } from "../utils/date";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";

export default async function initTopics() {
    const local = await loadLocalStorage(StorageKey.TOPICS);
    if (local && local.data && (local.lastUpdateTime && (Date.now() < local.lastUpdateTime + MS_OF_DAY))) {
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

export async function initTopicIds() {
    const topics = await initTopics();
    return Object.fromEntries(Object.entries(topics).map(([key, value]) => {
        if (typeof value === "string") {
            return [key, value];
        } else if (isTopicObject(value)) {
            return [key, value.id]
        } else {
            return [key, ""]
        }
    }))
}

function isTopicObject(v: any): v is Record<"id", string> {
    return Object.prototype.toString.call(v).slice(8, -1).toLowerCase() === "object" && v.hasOwnProperty("id")
}
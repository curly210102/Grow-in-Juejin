import { IPin, StorageKey } from "../types";
import { fetchUserPins } from "../utils/api";
import { saveLocalStorage } from "../utils/storage";

export default async function initUserPins(userId: string, earliestTime: number) {
    if (!userId) {
        return []
    }

    return await syncPinList(userId, earliestTime);
}

async function syncPinList(userId: string, earliestTime: number = 0) {
    // 请求最近的一批
    const oneRequestCount = 100;
    const newPinList: IPin[] = [];

    let nextCursor = "0";

    while (true) {
        const { cursor, data, has_more } = await fetchUserPins(userId, nextCursor, oneRequestCount);
        nextCursor = cursor;
        if (data) {
            data.forEach(pin => {
                if (+pin.msg_Info.ctime * 1000 >= earliestTime) {
                    newPinList.push({
                        id: pin.msg_id,
                        content: pin.msg_Info.content,
                        jcode: !!pin.jcode_info,
                        theme: pin.theme.name,
                        topic: pin.topic.title,
                        publishTime: +(pin.msg_Info.mtime ?? "0") * 1000
                    })
                }
            })
        }
        if (!data || !has_more || +(data.slice(-1)[0]?.msg_Info.ctime ?? "0") * 1000 < earliestTime) {
            break;
        }
    }

    await saveLocalStorage(StorageKey.PIN_LIST, newPinList);

    return newPinList;
}

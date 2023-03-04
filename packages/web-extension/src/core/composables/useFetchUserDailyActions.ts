import { ActionType, IDailyActions, StorageKey } from "../types";
import { inject, Ref, ref, watch } from "vue";
import { fetchUserDynamic } from "../utils/api";
import { startOfDate } from "../utils/date";
import { defaultSyncInjectContent, ISyncInjectContentType, syncInjectionKey, userInjectionKey } from "../utils/injectionKeys";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";

export default function useFetchUserDailyActions() {
    const dailyActions = ref<IDailyActions>({});
    let lastSyncActionTime = -1;
    let lastSyncActionCount = 0;
    const userId = inject<Ref<string>>(userInjectionKey, ref(""));
    const syncBoardCast = inject<ISyncInjectContentType>(syncInjectionKey, defaultSyncInjectContent);

    async function init() {
        await loadLocalStorage(StorageKey.DYNAMIC).then(data => {
            if (data) {
                dailyActions.value = data.actions;
                lastSyncActionTime = data.time
                lastSyncActionCount = data.count
            }
        })
        sync();
    }

    async function sync() {
        if (!userId) {
            dailyActions.value = {};
            lastSyncActionTime = -1;
            lastSyncActionCount = 0;
            return;
        }
        const completeSync = syncBoardCast.sync();
        // 请求最近的20条动态
        const lastDynamics = await fetchUserDynamic(userId.value, "0");
        const { cursor, list, count, hasMore } = lastDynamics;
        const oneRequestOffset = +cursor;
        const lastActionList = list;
        const tailOfLastActionList = list[list.length - 1];
        const isAttachLocalRecord = mergeActions(lastActionList);

        if (!isAttachLocalRecord) {
            // 根据动态总数的差值估算后续请求数
            const predictRequestTimes = (count > oneRequestOffset && tailOfLastActionList && tailOfLastActionList.time > lastSyncActionTime && hasMore) ? Math.ceil((count - lastSyncActionCount) / oneRequestOffset) : 0;
            const tailOfBatchDynamics = await batchSync(oneRequestOffset, predictRequestTimes);

            // 存在用户删除动态的情况，这时上一步的差值不一定够
            if (tailOfBatchDynamics) {
                const tailOfBatchActionList = tailOfBatchDynamics.list.slice(-1)[0];
                if (tailOfBatchActionList && tailOfBatchActionList.time > lastSyncActionTime && tailOfBatchDynamics.hasMore) {
                    await syncToAttachLocalRecord(userId.value, tailOfBatchDynamics.cursor);
                }
            }
        }

        if (lastActionList.length) {
            updateSyncFlag(lastActionList[0].time, count);
        }

        completeSync();
    }

    async function batchSync(oneRequestCount: number, predictRequestTimes: number) {
        // 防止大量并发请求崩掉服务器，限制一次只发10个请求
        const MAX_PARALLEL = 10;
        const batchRequestTimes = Math.ceil(predictRequestTimes / MAX_PARALLEL);
        const lastBatchRequestCount = predictRequestTimes % MAX_PARALLEL
        let lastDynamics = null;

        for (let time = 1; time <= batchRequestTimes; time++) {
            const parallelRequestCount = time === batchRequestTimes ? lastBatchRequestCount : MAX_PARALLEL;
            const prevCursor = oneRequestCount + (time - 1) * MAX_PARALLEL * oneRequestCount;
            const batchDynamics = await Promise.all(Array.from(new Array(parallelRequestCount), (_v, i) => i).map((i) => fetchUserDynamic(userId.value, `${prevCursor + i * oneRequestCount}`)))
            let isAttachLocalRecord = false;
            for (const { list } of batchDynamics) {
                isAttachLocalRecord = mergeActions(list);
                if (isAttachLocalRecord) {
                    return null;
                }
            }
            lastDynamics = batchDynamics.slice(-1)[0];
        }
        return lastDynamics;
    }

    async function syncToAttachLocalRecord(userId: string, cursor: string) {
        const { list, cursor: nextCursor, hasMore } = await fetchUserDynamic(userId, cursor)
        const isFinished = mergeActions(list);
        if (isFinished) {
            return
        } else if (hasMore) {
            await syncToAttachLocalRecord(userId, nextCursor);
        }
    }

    function mergeActions(list: Awaited<ReturnType<typeof fetchUserDynamic>>["list"]): boolean {
        for (const { action, time } of list) {
            if (lastSyncActionTime >= time) {
                return true;
            }
            const date = startOfDate(time * 1000);
            if (!dailyActions.value[date]) {
                dailyActions.value[date] = {
                    [ActionType.POST]: 0,
                    [ActionType.LKPOST]: 0,
                    [ActionType.PIN]: 0,
                    [ActionType.LKPIN]: 0,
                    [ActionType.FOLLOW]: 0
                }
            }

            if (action in dailyActions.value[date]) {
                dailyActions.value[date][action]++;
            }
        }

        return false;
    }

    function updateSyncFlag(time: number, count: number) {
        lastSyncActionTime = time;
        lastSyncActionCount = count;
        saveLocalStorage(StorageKey.DYNAMIC, {
            count: lastSyncActionCount,
            time: lastSyncActionTime,
            actions: dailyActions.value
        })
    }


    init();
    watch([userId], sync)

    return dailyActions;
}
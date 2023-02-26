import { ActionType, IDailyActions, StorageKey } from "@/types";
import { inject, Ref, ref, watch } from "vue";
import { fetchUserDynamic } from "../utils/api";
import { startOfDate } from "../utils/date";
import { userInjectionKey } from "../utils/injectionKeys";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";

export default function useFetchUserDailyActions() {
    const dailyActions = ref<IDailyActions>({});
    let lastSyncActionTime = -1;
    let lastSyncActionCount = 0;
    const userId = inject<Ref<string>>(userInjectionKey, ref(""));

    async function sync() {
        if (!userId) {
            dailyActions.value = {};
            lastSyncActionTime = -1;
            lastSyncActionCount = 0;
            return;
        }
        // 请求最近的20条动态
        const lastDynamics = await fetchUserDynamic(userId.value, "0");
        const { cursor, list, count, hasMore } = lastDynamics;
        const oneBatchCount = +cursor;
        const lastActionList = list;
        const tailOfLastActionList = list[list.length - 1];

        // 如果新增的动态大于20条，根据动态总数的差值估算后续请求数
        const predictRequestTimes = (count > oneBatchCount && tailOfLastActionList && tailOfLastActionList.time > lastSyncActionTime && hasMore) ? Math.ceil((count - lastSyncActionCount) / oneBatchCount) : 0;
        const batchDynamics = await Promise.all(Array.from(new Array(predictRequestTimes), (_v, i) => i).map((i) => fetchUserDynamic(userId.value, `${oneBatchCount + i * oneBatchCount}`)))
        const allActionList = [lastActionList].concat(batchDynamics.map(({ list }) => list));
        for (const list of allActionList) {
            const isFinished = mergeActions(list);
            if (isFinished) {
                break;
            }
        }

        // 存在用户删除动态的情况，这时上一步的差值不一定够
        const tailOfBatchDynamics = batchDynamics.slice(-1)[0];
        if (tailOfBatchDynamics) {
            const tailOfBatchActionList = tailOfBatchDynamics.list.slice(-1)[0];
            if (tailOfBatchActionList && tailOfBatchActionList.time > lastSyncActionTime && tailOfBatchDynamics.hasMore) {
                await syncToEnd(userId.value, tailOfBatchDynamics.cursor);
            }
        }

        if (lastActionList[0]) {
            updateSyncFlag(lastActionList[0].time, count);
        }
    }

    async function syncToEnd(userId: string, cursor: string) {
        const { list, cursor: nextCursor, hasMore } = await fetchUserDynamic(userId, cursor)
        const isFinished = mergeActions(list);
        if (isFinished) {
            return
        } else if (hasMore) {
            await syncToEnd(userId, nextCursor);
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

            dailyActions.value[date][action]++;
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

    init();
    watch([userId], sync)

    return dailyActions;
}
import { ActionType, IDailyActions, StorageKey } from "../types";
import { Ref, ref, watch, watchEffect } from "vue";
import { fetchUserDynamic } from "../utils/api";
import { getYear, startOfDate } from "../utils/date";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";

interface ISyncInfo {
    syncDateTime: number,
    count: number,
}

type DynamicList = Awaited<ReturnType<typeof fetchUserDynamic>>["list"];

function lastOfArray<T>(array: Array<T>) {
    return array[array.length - 1] ?? null;
}

function actionTotalCount(dailyAction?: IDailyActions[0]) {
    return Object.values(dailyAction ?? {}).reduce((total, count) => total + count, 0);
}

export default function useFetchUserDailyActions(userIdRef: Ref<string>, rangeRef: Ref<number[]>, storageKey: StorageKey.DYNAMIC | StorageKey.GUEST_DYNAMIC) {
    const dailyActions = ref<IDailyActions>({});
    const syncInfo = ref<ISyncInfo>({
        syncDateTime: 0,
        count: 0
    });
    const earliestYear = ref(getYear());
    const syncing = ref(false);

    async function initFromLocal() {
        const data = await loadLocalStorage(storageKey);
        const userData = storageKey === StorageKey.GUEST_DYNAMIC ? data?.[userIdRef.value] : data;
        if (userData) {
            dailyActions.value = userData.actions;
            syncInfo.value = userData.syncInfo;
        }
    }

    async function saveToLocal() {
        const saveContent = {
            actions: dailyActions.value,
            syncInfo: syncInfo.value
        };

        if (storageKey === StorageKey.GUEST_DYNAMIC) {
            await saveLocalStorage(storageKey, {
                [userIdRef.value]: saveContent
            })
        } else {
            await saveLocalStorage(storageKey, saveContent);
        }
    }

    async function syncNewestDynamics() {
        const userId = userIdRef.value;
        const { syncDateTime } = syncInfo.value;
        const addedDynamicList: DynamicList = [];
        const rangeStart = rangeRef.value[0];
        const untilDateTime = Math.max(rangeStart, syncDateTime);
        const { count: currentTotalCount, list: newestDynamicList, cursor: oneSliceCount, hasMore, lastDynamic: lastDynamicOfNewest } = await fetchDynamics(userId, 0);
        addedDynamicList.push(...newestDynamicList);

        const needMoreRequest = hasMore && lastDynamicOfNewest && lastDynamicOfNewest.time * 1000 >= untilDateTime;
        const requestedAddedCount = newestDynamicList.length;

        if (needMoreRequest) {
            // 先做批量请求
            const prevTotalCount = syncInfo.value.count;
            // totalChanges = added - deleted
            const totalChanges = currentTotalCount - (prevTotalCount - actionTotalCount(dailyActions.value[syncDateTime]));
            // 预估新增的动态数
            const predictAddedCount = totalChanges > 0 ? totalChanges : currentTotalCount;
            const predictRequestTimes = Math.ceil((predictAddedCount - requestedAddedCount) / oneSliceCount);
            const { dynamicList, nextCursor } = await fetchDynamicsParallel(userId, predictRequestTimes, oneSliceCount, oneSliceCount, untilDateTime);
            addedDynamicList.push(...dynamicList);

            // totalChanges > 0 但有 deleted，增加的数量比预计的要多
            if (nextCursor) {
                const dynamicList = await fetchUntilDateTime(userId, untilDateTime, nextCursor);
                addedDynamicList.push(...dynamicList);
            }
        }

        mergeDailyActions(addedDynamicList, untilDateTime);

        updateSyncInfo(addedDynamicList[0], currentTotalCount);
    }




    function mergeDailyActions(dynamicList: DynamicList, untilDateTime: number) {
        for (const { time, action } of dynamicList) {
            if (untilDateTime > time * 1000) {
                break;
            }
            const date = startOfDate(time * 1000);
            if (!dailyActions.value[date] || date === untilDateTime) {
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
    }

    function updateSyncInfo(dynamic?: DynamicList[0], count?: number) {
        syncInfo.value = {
            syncDateTime: dynamic ? startOfDate(dynamic.time * 1000) : 0,
            count: count ?? 0
        }
    }


    watch([userIdRef, rangeRef], async () => {
        if (syncing.value) {
            return;
        }
        syncing.value = true;
        await initFromLocal();
        await syncNewestDynamics();
        await saveToLocal();
        syncing.value = false;
    }, {
        immediate: true
    })

    return {
        dailyActions,
        earliestYear,
        syncing
    }
}


async function fetchDynamics(userId: string, requestCursor: number = 0) {
    const { count, cursor, list, hasMore } = await fetchUserDynamic(userId, `${requestCursor}`);
    return {
        count,
        cursor: +cursor,
        list,
        hasMore,
        lastDynamic: lastOfArray(list)
    }
}

const MAX_PARALLEL = 5;
async function fetchDynamicsParallel(userId: string, requestTimes: number, startCursor: number, oneSliceCount: number, untilDateTime: number) {
    const parallelTimes = Math.ceil(requestTimes / MAX_PARALLEL);
    const dynamicList: DynamicList = [];
    let nextCursor = null;
    for (let i = 0; i < parallelTimes; i++) {
        const parallelRequestCount = i === parallelTimes - 1 ? requestTimes % MAX_PARALLEL : MAX_PARALLEL;
        const prevCursor = startCursor + i * MAX_PARALLEL * oneSliceCount;
        const parallelRequests = await Promise.all(Array.from(new Array(parallelRequestCount), (_v, i) => i).map((i) => fetchDynamics(userId, prevCursor + i * oneSliceCount)));

        for (const { list, lastDynamic, hasMore, cursor } of parallelRequests) {
            dynamicList.push(...list);
            nextCursor = cursor;
            if (!lastDynamic || lastDynamic.time * 1000 < untilDateTime || !hasMore) {
                return {
                    dynamicList,
                    nextCursor: null
                };
            }
        }
    }

    return {
        dynamicList,
        nextCursor
    };
}

async function fetchUntilDateTime(userId: string, untilDateTime: number, cursor: number, allList: DynamicList = []): Promise<DynamicList> {
    const { list, lastDynamic, hasMore, cursor: nextCursor } = await fetchDynamics(userId, cursor);

    if (!lastDynamic || lastDynamic.time * 1000 < untilDateTime || !hasMore) {
        return allList.concat(list);
    }

    return await fetchUntilDateTime(userId, untilDateTime, nextCursor, allList.concat(list));
}
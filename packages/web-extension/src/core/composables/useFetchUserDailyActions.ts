import { ActionType, IDailyActions, StorageKey } from "../types";
import { computed, Ref, ref, watch } from "vue";
import { fetchUserDynamic } from "../utils/api";
import { getYear, MS_OF_7DAY, startOfDate } from "../utils/date";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";

interface ISyncInfo {
    syncDateTime: number,
    count: number,
    earliestYear: number
}

type DynamicList = Awaited<ReturnType<typeof fetchUserDynamic>>["list"];

type LocalData = {
    actions: IDailyActions,
    syncInfo: ISyncInfo
}

function lastOfArray<T>(array: Array<T>) {
    return array[array.length - 1] ?? null;
}

function actionTotalCount(dailyAction?: IDailyActions[0]) {
    return Object.values(dailyAction ?? {}).reduce((total, count) => total + count, 0);
}

export default function useFetchUserDailyActions(userIdRef: Ref<string>, rangeRef: Ref<readonly number[]>) {
    const dailyActions = ref<IDailyActions>({});
    const syncInfo = ref<ISyncInfo>({
        syncDateTime: 0,
        count: 0,
        earliestYear: 0
    });
    const syncing = ref(false);

    async function loadFromLocal(userId: string) {
        const data = await loadLocalStorage(StorageKey.DYNAMIC);
        const userData = data?.[userId]?.content
        if (userData) {
            dailyActions.value = userData.actions;
            syncInfo.value = userData.syncInfo;
        }
    }

    async function saveToLocal(userId: string) {
        const data = await loadLocalStorage(StorageKey.DYNAMIC) ?? {};
        data[userId] = {
            content: {
                actions: dailyActions.value,
                syncInfo: syncInfo.value
            },
            expireTime: Date.now() + MS_OF_7DAY
        };
        await saveLocalStorage(StorageKey.DYNAMIC, data);
    }

    async function cleanupCache() {
        const data = await loadLocalStorage(StorageKey.DYNAMIC);
        const currentTime = Date.now();
        const filteredRecords: Record<string, {
            content: LocalData,
            expireTime: number
        }> = {};
        if (data) {
            Object.keys(data).forEach(userId => {
                const record = data[userId];
                if (record.expireTime > currentTime) {
                    filteredRecords[userId] = record;
                }
            })
        }
        await saveLocalStorage(StorageKey.DYNAMIC, filteredRecords);
    }

    async function syncNewestDynamics(userId: string, range: readonly number[]) {
        const { syncDateTime, count: prevTotalCount } = syncInfo.value;
        const addedDynamicList: DynamicList = [];
        const rangeStart = range[0];
        const untilDateTime = Math.max(rangeStart, syncDateTime);
        const { count: currentTotalCount, list: newestDynamicList, cursor: oneSliceCount, hasMore, lastDynamic: lastDynamicOfNewest } = await fetchDynamics(userId, 0);
        addedDynamicList.push(...newestDynamicList);

        const needMoreRequest = hasMore && lastDynamicOfNewest && lastDynamicOfNewest.time * 1000 >= untilDateTime;
        const requestedAddedCount = newestDynamicList.length;

        if (needMoreRequest) {
            // 先做批量请求
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

        const earliestYear = await getEarliestPublicationYear(userId, currentTotalCount, oneSliceCount);
        mergeDailyActions(addedDynamicList, untilDateTime)
        updateSyncInfo(addedDynamicList[0], currentTotalCount, earliestYear);
    }

    function mergeDailyActions(dynamicList: DynamicList, untilDateTime: number) {
        dailyActions.value[untilDateTime] = {
            [ActionType.POST]: 0,
            [ActionType.LKPOST]: 0,
            [ActionType.PIN]: 0,
            [ActionType.LKPIN]: 0,
            [ActionType.FOLLOW]: 0
        }
        for (const { time, action } of dynamicList) {
            if (untilDateTime > time * 1000) {
                break;
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
    }

    function updateSyncInfo(dynamic?: DynamicList[0], count?: number, earliestYear?: number) {
        syncInfo.value = {
            ...syncInfo.value,
            syncDateTime: dynamic ? startOfDate(dynamic.time * 1000) : 0,
            count: count ?? 0,
            earliestYear: earliestYear ?? 0
        }
    }

    async function getEarliestPublicationYear(userId: string, totalCount: number, onSliceCount: number) {
        const { earliestYear } = syncInfo.value;
        if (earliestYear) {
            return earliestYear;
        }

        const lastCursor = (Math.ceil(totalCount / onSliceCount) - 1) * onSliceCount;
        const { hasMore, lastDynamic } = await fetchDynamics(userId, lastCursor);
        if (!hasMore && lastDynamic) {
            return getYear(lastDynamic.time * 1000)
        }

        return getYear();

    }

    watch([userIdRef, rangeRef], async (newValue) => {
        if (syncing.value) {
            return;
        }
        syncing.value = true;

        const userId = newValue[0]
        const range = newValue[1];
        // 先初始化本地数据
        await loadFromLocal(userId);
        // 更新最新动态
        await syncNewestDynamics(userId, range);
        // 将更新后的动态保存到本地
        await saveToLocal(userId);
        // 清除过期的本地数据
        await cleanupCache();
        syncing.value = false;
    }, {
        immediate: true
    })

    const earliestYear = computed(() => {
        return syncInfo.value.earliestYear || getYear();
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



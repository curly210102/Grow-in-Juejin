import { ActionType, IDailyActions, StorageKey } from "../types";
import { computed, Ref, ref, watch } from "vue";
import { fetchUserDynamic } from "../utils/api";
import { getYear, MS_OF_7DAY, startOfDate } from "../utils/date";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";


interface ISyncInfo {
    syncDateTime: number,
    count: number,
    earliestYear: number,
    lastCursor: number,
    lastDateTime: number
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

// 掘金的dynamic接口count只会增不会减，
// 分片也是只会往后推，不会往前提
export default function useFetchUserDailyActions(userIdRef: Ref<string>, rangeRef: Ref<readonly number[]>) {
    const dailyActions = ref<IDailyActions>({});
    const syncInfo = ref<ISyncInfo>({
        syncDateTime: 0,
        count: 0,
        earliestYear: 0,
        lastCursor: 0,
        lastDateTime: Infinity
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

        let newLastCursor = 0;

        if (needMoreRequest) {
            // 先做批量请求
            const predictAddedCount = currentTotalCount - (prevTotalCount - actionTotalCount(dailyActions.value[syncDateTime]));
            // 预估新增的动态数
            const predictRequestTimes = Math.ceil((predictAddedCount - requestedAddedCount) / oneSliceCount);
            const { dynamicList, lastCursor } = await fetchDynamicsParallel(userId, predictRequestTimes, oneSliceCount, oneSliceCount, untilDateTime);
            newLastCursor = lastCursor;
            addedDynamicList.push(...dynamicList)
        }

        const earliestYear = await getEarliestPublicationYear(userId, currentTotalCount, oneSliceCount);
        mergeDailyActions(addedDynamicList, untilDateTime)
        updateSyncInfo({
            dynamic: addedDynamicList[0], count: currentTotalCount, earliestYear, lastDateTime: untilDateTime, lastCursor: newLastCursor
        });

        return oneSliceCount;
    }

    async function syncSpecifiedRangeDynamics(userId: string, range: readonly number[], oneSliceCount: number) {
        const { lastCursor, lastDateTime } = syncInfo.value;
        const rangeStart = range[0];
        if (lastDateTime <= rangeStart) {
            return;
        }

        const { dynamicList, lastCursor: newLastCursor } = await fetchDynamicsParallel(userId, Math.ceil(syncInfo.value.count / oneSliceCount), lastCursor, oneSliceCount, rangeStart);

        mergeDailyActions(dynamicList, rangeStart);
        updateSyncInfo({
            lastDateTime: rangeStart,
            lastCursor: newLastCursor
        });

    }

    function mergeDailyActions(dynamicList: DynamicList, untilDateTime: number) {
        dailyActions.value[untilDateTime] = {
            [ActionType.POST]: 0,
            [ActionType.LKPOST]: 0,
            [ActionType.PIN]: 0,
            [ActionType.LKPIN]: 0,
            [ActionType.FOLLOW]: 0
        }
        const newDailyActions: IDailyActions = {};
        for (const { time, action } of dynamicList) {
            if (untilDateTime > time * 1000) {
                break;
            }
            const date = startOfDate(time * 1000);
            if (!newDailyActions[date]) {
                newDailyActions[date] = {
                    [ActionType.POST]: 0,
                    [ActionType.LKPOST]: 0,
                    [ActionType.PIN]: 0,
                    [ActionType.LKPIN]: 0,
                    [ActionType.FOLLOW]: 0
                }
            }

            if (action in newDailyActions[date]) {
                newDailyActions[date][action]++;
            }
        }

        dailyActions.value = {
            ...newDailyActions,
            ...dailyActions.value
        }
    }

    function updateSyncInfo(info: { dynamic?: DynamicList[0], count?: number, earliestYear?: number, lastDateTime?: number, lastCursor?: number }) {
        if (info.dynamic) {
            syncInfo.value.syncDateTime = startOfDate(info.dynamic.time * 1000)
        }
        if (info.count) {
            syncInfo.value.count = info.count;
        }
        if (info.earliestYear) {
            syncInfo.value.earliestYear = info.earliestYear;
        }
        if (info.lastDateTime) {
            syncInfo.value.lastDateTime = Math.min(syncInfo.value.lastDateTime ?? Infinity, info.lastDateTime)
        }
        if (info.lastCursor) {
            syncInfo.value.lastCursor = Math.max(syncInfo.value.lastCursor ?? 0, info.lastCursor)
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
        const oneSliceCount = await syncNewestDynamics(userId, range);
        // 拉取现有数据外的区域
        await syncSpecifiedRangeDynamics(userId, range, oneSliceCount);
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
    const response = await fetchUserDynamic(userId, `${requestCursor}`);

    if (!response) {
        return {
            count: 0,
            list: [],
            hasMore: false,
            cursor: 0,
            lastDynamic: null
        }
    } else {
        const { count, cursor, list, hasMore } = response;
        return {
            count,
            cursor: +cursor,
            list,
            hasMore,
            lastDynamic: lastOfArray(list)
        }
    }


}

const MAX_PARALLEL = 10;
async function fetchDynamicsParallel(userId: string, requestTimes: number, startCursor: number, oneSliceCount: number, untilDateTime: number) {
    const parallelTimes = Math.ceil(requestTimes / MAX_PARALLEL);
    const dynamicList: DynamicList = [];
    for (let i = 0; i < parallelTimes; i++) {
        const parallelRequestCount = i === parallelTimes - 1 ? requestTimes % MAX_PARALLEL : MAX_PARALLEL;
        const prevCursor = startCursor + i * MAX_PARALLEL * oneSliceCount;
        const parallelRequests = await Promise.all(Array.from(new Array(parallelRequestCount), (_v, i) => i).map((i) => fetchDynamics(userId, prevCursor + i * oneSliceCount)));

        for (let i = 0, len = parallelRequests.length; i < len; i++) {
            const { list, lastDynamic, hasMore } = parallelRequests[i];
            dynamicList.push(...list);
            if (!lastDynamic || lastDynamic.time * 1000 < untilDateTime || !hasMore) {
                return {
                    dynamicList,
                    lastCursor: prevCursor + i * oneSliceCount
                }
            }
        }
    }

    return {
        dynamicList,
        lastCursor: startCursor + requestTimes * oneSliceCount
    };
}

async function fetchUntilDateTime(userId: string, untilDateTime: number, cursor: number, allList: DynamicList = []): Promise<DynamicList> {
    const { list, lastDynamic, hasMore, cursor: nextCursor } = await fetchDynamics(userId, cursor);

    if (!lastDynamic || lastDynamic.time * 1000 < untilDateTime || !hasMore) {
        return allList.concat(list);
    }

    return await fetchUntilDateTime(userId, untilDateTime, nextCursor, allList.concat(list));
}



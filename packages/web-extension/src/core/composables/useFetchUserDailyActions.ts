import { ActionType, IDailyActions, StorageKey } from "@/types";
import { inject, ref, watch, watchEffect } from "vue";
import { fetchUserDynamic } from "../utils/api";
import { startOfDate } from "../utils/date";
import { userInjectionKey } from "../utils/injectionKeys";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";

export default function useFetchUserDailyActions() {
    const dailyActions = ref<IDailyActions>({});
    const userId = inject<string>(userInjectionKey);
    const cursor = ref("0");

    loadLocalStorage(StorageKey.DYNAMIC).then(data => {
        dailyActions.value = data;
    })

    function doFetch() {
        const actions: IDailyActions = {};
        if (userId) {
            fetchUserDynamic(userId, cursor.value).then(remote => {
                remote.list.forEach(({ action, time }) => {
                    const date = startOfDate(time * 1000);
                    if (!actions[date]) {
                        actions[date] = {
                            [ActionType.POST]: 0,
                            [ActionType.LKPOST]: 0,
                            [ActionType.PIN]: 0,
                            [ActionType.LKPIN]: 0,
                            [ActionType.FOLLOW]: 0
                        }
                    }

                    actions[date][action]++;
                });
                dailyActions.value = actions;
                // cursor.value = remote.cursor;
            })
        }
    }

    // watchEffect(doFetch);

    watch(dailyActions, (value) => {
        saveLocalStorage(StorageKey.DYNAMIC, value);
    })

    return dailyActions;
}
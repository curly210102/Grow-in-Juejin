import { ActionType, IDailyActions } from "@/types";
import { inject, ref, unref, watchEffect } from "vue";
import { fetchUserDynamic } from "../utils/api";
import { userInjectionKey } from "../utils/injectionKeys";

const SECOND_OF_DAY = 3600 * 24;

export default function useFetchUserDailyActions() {
    const dailyActions = ref<IDailyActions>({});
    const userId = inject<string>(userInjectionKey);
    const cursor = ref("0");

    function doFetch() {
        if (userId) {
            fetchUserDynamic(userId, cursor.value).then(remote => {
                remote.list.forEach(({ action, time }) => {
                    const date = (time - time % SECOND_OF_DAY) * 1000;
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
                });
                cursor.value = remote.cursor;
            })
        }
    }

    // watchEffect(doFetch);

    return { dailyActions };
}
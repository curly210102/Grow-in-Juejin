import { inject, ref } from "vue";
import { IActivity } from "../types";
import { fetchActivities } from "../utils/api";
import { defaultSyncInjectContent, ISyncInjectContentType, syncInjectionKey } from "../utils/injectionKeys";


export default function useFetchActivities() {
    const activities = ref<Array<IActivity>>([]);
    const syncBoardCast = inject<ISyncInjectContentType>(syncInjectionKey, defaultSyncInjectContent);

    const completeSync = syncBoardCast.sync();
    fetchActivities().then(data => {
        activities.value = data
    }).finally(() => {
        completeSync();
    });

    return activities
}

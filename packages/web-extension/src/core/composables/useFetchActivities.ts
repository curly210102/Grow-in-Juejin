import { inject, ref } from "vue";
import initActivities from "../clientRequests/initActivities";
import { IActivity } from "../types";
import { defaultSyncInjectContent, ISyncInjectContentType, syncInjectionKey } from "../utils/injectionKeys";


export default function useFetchActivities() {
    const activities = ref<Array<IActivity>>([]);
    const syncBoardCast = inject<ISyncInjectContentType>(syncInjectionKey, defaultSyncInjectContent);

    const completeSync = syncBoardCast.sync();
    initActivities().then(data => {
        activities.value = data
    }).finally(() => {
        completeSync();
    });

    return activities
}

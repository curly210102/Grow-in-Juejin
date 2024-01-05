import { inject, reactive } from "vue";
import initArticleActivities from "../clientRequests/initArticleActivities";
import { defaultSyncInjectContent, ISyncInjectContentType, syncInjectionKey, IActivityInjectContentType } from "../utils/injectionKeys";
import initPinActivities from "../clientRequests/initPinActivities";
import initOtherActivities from "../clientRequests/initOtherActivities";


export default function useFetchAllActivities() {
    const activities = reactive<IActivityInjectContentType>({
        article: [],
        pin: [],
        other: []
    })
    const syncBoardCast = inject<ISyncInjectContentType>(syncInjectionKey, defaultSyncInjectContent);

    const completeSync = syncBoardCast.sync();

    Promise.allSettled([initArticleActivities(), initPinActivities(), initOtherActivities()]).then((results) => {
        if (results[0].status === "fulfilled") {
            activities.article = results[0].value;
        }
        if (results[1].status === "fulfilled") {
            activities.pin = results[1].value;
        }
        if (results[2].status === "fulfilled") {
            activities.other = results[2].value;
        }
    }).finally(() => {
        completeSync();
    })

    return activities
}

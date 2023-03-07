import initUserProfile from "@/core/clientRequests/initUserProfile";
import { StorageKey } from "@/core/types";
import { loadLocalStorage } from "@/core/utils/storage";
import { getCurrentUserId } from "../utils/getInformation";
import onRouteChange from "../utils/onRouteChange";
import { CustomJoinedActivity, register } from "./components";

register();

const intervalIds: number[] = [];
render();
onRouteChange(() => {
    intervalIds.forEach(clearInterval);
    intervalIds.length = 0;
    render();
});


async function render() {
    const userId = getCurrentUserId();
    if (userId) {
        const myUserId = window?.__NUXT__?.state?.avatarMenuInfo?.user_basic?.user_id;
        if (userId === myUserId) {
            // 为了保证 storage 里存的都是当前用户的数据
            const localUserProfile = await loadLocalStorage(StorageKey.USER);
            if (localUserProfile && myUserId !== localUserProfile.userId) {
                await chrome.storage.local.clear();
                await initUserProfile();
            }
            // 页面中的元素不一定已经挂载，设置一个上限5次的轮询
            let attemptTimes = 0;
            if (!renderJoinedActivities(userId)) {
                const intervalId = setInterval(() => {
                    if (++attemptTimes > 5 || renderJoinedActivities(userId)) {
                        clearInterval(intervalId);
                    }
                }, 100);
                intervalIds.push(intervalId);
            }
        }
    }
}


function renderJoinedActivities(userId: string) {
    const followBlock = document.querySelector("#juejin > div.view-container > main > div.view.user-view > div.minor-area > div > div.follow-block.block.shadow");
    if (followBlock) {
        const activityBlock = document.createElement("div");
        activityBlock.append(new CustomJoinedActivity({
            userId
        }));
        followBlock.insertAdjacentElement("afterend", activityBlock);
        return true;
    }
    return false
}
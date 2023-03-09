import initUserProfile from "@/core/clientRequests/initUserProfile";
import { getCurrentUserId } from "../utils/getInformation";
import onRouteChange from "../utils/onRouteChange";
import { CustomJoinedActivity, register } from "./components";

register();
main();

async function main() {
    // 进入页面后先检查用户是否已切换，确保 storage 中存的都是当前用户的数据
    const { userId: myUserId } = await initUserProfile()

    let currentRenderWork = renderFeatures(myUserId);
    onRouteChange(() => {
        if (currentRenderWork) {
            currentRenderWork.abort();
        }
        renderFeatures(myUserId);
    });
}

function renderFeatures(myUserId?: string) {
    const userId = myUserId;
    if (myUserId && userId === myUserId) {
        // My Features
        const joinedActivitiesLoop = loopObserver(() => renderJoinedActivities(myUserId))
        return {
            abort() {
                joinedActivitiesLoop?.abort();
            }
        }
    }
}

function renderJoinedActivities(myUserId: string) {
    const userId = getCurrentUserId();
    const followBlock = document.querySelector("#juejin > div.view-container > main > div.view.user-view > div.minor-area > div > div.follow-block.block.shadow");
    if (followBlock && myUserId === userId) {
        const activityBlock = document.createElement("div");
        activityBlock.append(new CustomJoinedActivity({
            userId
        }));
        followBlock.insertAdjacentElement("afterend", activityBlock);
        return true;
    }
    return false
}

function loopObserver(job: () => boolean, maxTimes: number = 5) {
    const success = job();
    if (!success) {
        const intervalId = setInterval(() => {
            if (--maxTimes < 0 || job()) {
                clearInterval(intervalId);
            }
        }, 100)
        return {
            abort() {
                maxTimes = 0;
                clearInterval(intervalId);
            }
        }
    }
}
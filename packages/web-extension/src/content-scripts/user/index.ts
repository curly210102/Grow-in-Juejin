import initUserProfile from "@/core/clientRequests/initUserProfile";
import { getCurrentUserId } from "../utils/getInformation";
import onRouteChange from "../utils/onRouteChange";
import { CustomJoinedActivity, CustomUserTrace, register } from "./components";

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
    const userId = getCurrentUserId();
    const loops: ReturnType<typeof loopObserver>[] = [];

    loops.push(loopObserver(() => renderUserGrowTrending(myUserId)));
    if (myUserId && userId === myUserId) {
        loops.push(loopObserver(() => renderJoinedActivities(myUserId)));
    }

    return {
        abort() {
            loops.forEach(loop => loop?.abort())
            loops.length = 0;
        }
    }
}

function renderJoinedActivities(myUserId: string) {
    const userId = getCurrentUserId();
    const followBlock = document.querySelector("#juejin > div.view-container > main > div.view.user-view > div.minor-area > div > div.follow-block.block.shadow");
    const container = document.querySelector<HTMLDivElement>("#juejin > div.view-container > main > div.view.user-view > div.minor-area > div");
    if (container && followBlock && myUserId === userId) {
        container.style.bottom = "10px";
        container.style.overflow = "auto";
        container.style.marginRight = "-1rem";
        container.style.paddingRight = "1rem";
        const activityBlock = document.createElement("div");
        activityBlock.append(new CustomJoinedActivity({
            userId
        }));
        followBlock.insertAdjacentElement("afterend", activityBlock);
        return true;
    }
    return false
}

function renderUserGrowTrending(myUserId?: string) {
    const userId = getCurrentUserId();
    const listBlock = document.querySelector("#juejin > div.view-container > main > div.view.user-view > div.major-area > div.list-block");

    if (listBlock) {
        const trendingBlock = document.createElement("div");
        listBlock.insertAdjacentElement("beforebegin", trendingBlock);
        trendingBlock.style.marginTop = "1rem";
        setTimeout(() => {
            trendingBlock.append(new CustomUserTrace({
                userId,
                inMyPage: myUserId === userId,
            }));
        })
        return true;
    }

    return false;
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
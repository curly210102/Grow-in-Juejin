import initUserProfile from "@/core/clientRequests/initUserProfile";
import { getCurrentUserId } from "../utils/getInformation";
import onRouteChange from "../utils/onRouteChange";
import { CustomJoinedArticleActivity, CustomUserTagRadar, CustomUserTrace, register } from "./components";
import { initUserArticleList } from "@/core/clientRequests/initUserArticles";

register();
main();

async function main() {
    // 进入页面后先检查用户是否已切换，确保 storage 中存的都是当前用户的数据
    const { userId: myUserId } = await initUserProfile()

    let currentRenderWork = renderWhenEnterUserProfilePage(myUserId);
    onRouteChange(() => {
        if (currentRenderWork) {
            currentRenderWork.abort();
        }
        currentRenderWork = renderWhenEnterUserProfilePage(myUserId);
    });
}

function renderWhenEnterUserProfilePage(myUserId?: string) {
    if (/https:\/\/juejin\.cn\/user\/\d+/.test(window.location.href)) {
        return renderFeatures(myUserId);
    } else {
        return null;
    }
}

function renderFeatures(myUserId?: string) {
    const userId = getCurrentUserId();
    const loops: ReturnType<typeof loopObserver>[] = [];

    loops.push(loopObserver(() => renderUserGrowTrending(myUserId)));
    loops.push(loopObserver(() => renderUserTagRadar(myUserId)));
    if (myUserId && userId === myUserId) {
        loops.push(loopObserver(() => renderJoinedActivities()));
    }

    initUserArticleList(userId);

    return {
        abort() {
            loops.forEach(loop => loop?.abort())
            loops.length = 0;
        }
    }
}

function renderJoinedActivities() {
    const userId = getCurrentUserId();
    const moreBlock = document.querySelector("#juejin > div.view-container > main > div.view.user-view > div.minor-area > div > div.more-block.block");
    const container = document.querySelector<HTMLDivElement>("#juejin > div.view-container > main > div.view.user-view > div.minor-area > div");
    if (container && moreBlock) {
        container.style.bottom = "10px";
        container.style.overflow = "auto";
        container.style.marginRight = "-1rem";
        container.style.paddingRight = "1rem";
        const activityBlock = document.createElement("div");
        activityBlock.append(new CustomJoinedArticleActivity({
            userId
        }));
        moreBlock.insertAdjacentElement("beforebegin", activityBlock);
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

function renderUserTagRadar(myUserId?: string) {
    const userId = getCurrentUserId();
    const summaryBlock = document.querySelector("#juejin > div.view-container > main > div.view.user-view > div.minor-area > div > div.stat-block");
    const followBlock = document.querySelector("#juejin > div.view-container > main > div.view.user-view > div.minor-area > div > div.follow-block.block.shadow");
    const container = document.querySelector<HTMLDivElement>("#juejin > div.view-container > main > div.view.user-view > div.minor-area > div");
    if (container && followBlock && summaryBlock) {
        container.style.bottom = "10px";
        container.style.overflow = "auto";
        container.style.marginRight = "-1rem";
        container.style.paddingRight = "1rem";
        const activityBlock = summaryBlock.cloneNode(true) as HTMLDivElement;
        const titleBlock = activityBlock.querySelector(".block-title");
        if (titleBlock) {
            titleBlock.innerHTML = "偏好分布";
            activityBlock.innerHTML = titleBlock.outerHTML;
        } else {
            activityBlock.innerHTML = "";
        }
        activityBlock.append(new CustomUserTagRadar({
            userId,
            inMyPage: myUserId === userId
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
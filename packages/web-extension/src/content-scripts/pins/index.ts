import onRouteChange from "../utils/onRouteChange";
import { register, CustomPinActivities } from "./components";

register();
main();

async function main() {
    let currentRenderWork = renderWhenEnterPinsPage();
    onRouteChange(() => {
        if (currentRenderWork) {
            currentRenderWork.abort();
        }
        currentRenderWork = renderWhenEnterPinsPage();
    });
}

function renderWhenEnterPinsPage() {
    if (/https:\/\/juejin\.cn\/pins(\/|$)/.test(window.location.href)) {
        return renderFeatures();
    } else {
        return null;
    }
}


function renderFeatures() {
    const loops: ReturnType<typeof loopObserver>[] = [];

    loops.push(loopObserver(() => renderCurrentActivities()));

    return {
        abort() {
            loops.forEach(loop => loop?.abort())
            loops.length = 0;
        }
    }
}

function renderCurrentActivities() {
    const userBlock = document.querySelector("#juejin > div.view-container.pin_container > main > main > div.sidebar > div.userbox");
    const listBlock = document.querySelector("#juejin > div.view-container.pin_container > main > main > div.sidebar > div.list_box.pin")
    if (userBlock && listBlock) {
        const userId = userBlock.querySelector<HTMLAnchorElement>("div.status > a[href^='/user/']")?.href?.match(/\/user\/(\d+)/)?.[1];
        if (!userId) {
            return false;
        }

        const activityBlock = listBlock.cloneNode(true) as HTMLDivElement;
        const titleBlock = activityBlock.querySelector(".title")
        if (titleBlock) {
            titleBlock.innerHTML = "沸点活动";
            activityBlock.innerHTML = titleBlock?.outerHTML;
            activityBlock.append(new CustomPinActivities({
                userId
            }));
            userBlock.insertAdjacentElement("afterend", activityBlock);
            return true;
        }
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
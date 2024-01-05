import { extCode } from "@/constant";
import onRouteChange from "../utils/onRouteChange";
import { register, CustomPinActivities } from "./components";
import { disconnect } from "echarts";

register();
main();


const state: {
    "topicDescriptions": Record<string, string>
} = {
    topicDescriptions: {}
}
chrome.runtime.sendMessage({
    to: "Grow in Juejin Background",
    code: extCode,
    content: "requestTopicDescriptions",
}).then(data => state.topicDescriptions = data)

function queryTopicDescription(topic: string) {
    return state.topicDescriptions[topic] ?? "快和掘友一起分享新鲜事！告诉你个小秘密，发布沸点时添加圈子和话题会被更多掘友看到哦～"
}

async function main() {
    let currentRenderWork = renderWhenEnterPinsPage();
    let observer = observeWhenEnterPinsPage();
    onRouteChange(() => {
        if (observer) {
            observer.disconnect();
        }
        if (currentRenderWork) {
            currentRenderWork.abort();
        }
        currentRenderWork = renderWhenEnterPinsPage();
        observer = observeWhenEnterPinsPage();
    });
}

function renderWhenEnterPinsPage() {
    if (/https:\/\/juejin\.cn\/pins(\/|$)/.test(window.location.href)) {
        return renderFeatures();
    } else {
        return null;
    }
}

function observeWhenEnterPinsPage() {
    if (/https:\/\/juejin\.cn\/pins(\/|$)/.test(window.location.href)) {
        const tdObserver = updateTopicDescription();

        return {
            disconnect() {
                tdObserver?.disconnect();
            }
        }
    } else {
        return null;
    }

}

function updateTopicDescription() {
    const pinEditor = document.querySelector("div.pin-editor-dialog.pin-editor");

    if (pinEditor) {
        const editor = pinEditor.querySelector(".rich-editor");
        const topicNode = pinEditor.querySelector(".new_topic")?.childNodes[1];

        if (topicNode && editor) {
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === "characterData" && mutation.target.nodeType === Node.TEXT_NODE) {
                        const topic = mutation.target.nodeValue?.trim() ?? "";
                        editor.setAttribute("placeholder", queryTopicDescription(topic ?? ""))
                    }
                }
            });
            observer.observe(topicNode, { characterData: true });

            return observer;
        }
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
        const hotListBlock = activityBlock.querySelector(".hot_list");
        if (titleBlock && hotListBlock) {
            titleBlock.innerHTML = "沸点活动";
            hotListBlock.innerHTML = "";
            hotListBlock.append(new CustomPinActivities({
                userId
            }));
            userBlock.insertAdjacentElement("afterend", activityBlock);
            return true;
        } else {
            return false;
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
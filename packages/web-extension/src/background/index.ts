import { extCode } from "@/constant";
import initArticleActivities from "@/core/clientRequests/initArticleActivities";
import initOtherActivities from "@/core/clientRequests/initOtherActivities";
import initPinActivities from "@/core/clientRequests/initPinActivities";
import {
    initTopicDescriptions,
    initTopicIds,
} from "@/core/clientRequests/initTopics";
import { batchSaveLocalStorage } from "@/core/utils/storage";
import { StorageKey } from "@/core/types";

async function checkSiteMounted() {
    const timeout = 5 * 60 * 1000;
    const startTime = Date.now();

    while (!window.$nuxt?._isMounted) {
        if (Date.now() - startTime >= timeout) {
            return false; // 超时跳出轮询
        }
        await (new Promise((resolve) => setTimeout(resolve, 3000)));
    }

    return true;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (
        sender.id === chrome.runtime.id &&
        sender.origin === "https://juejin.cn" &&
        message?.to === "Grow in Juejin Background" &&
        message?.code === extCode
    ) {
        if (message.content === "requestAllActivities") {
            Promise.all([
                initArticleActivities(),
                initPinActivities(),
                initOtherActivities(),
            ]).then((value) => {
                sendResponse({
                    article: value[0],
                    pin: value[1],
                    other: value[2],
                });
            });
            // The callback of onMessage should return a literal true value (documentation) in order to keep the internal messaging channel open so that sendResponse can work asynchronously.
            return true;
        }
        if (message.content === "requestArticleActivities") {
            initArticleActivities().then(sendResponse);
            // The callback of onMessage should return a literal true value (documentation) in order to keep the internal messaging channel open so that sendResponse can work asynchronously.
            return true;
        }
        if (message.content === "requestPinActivities") {
            initPinActivities().then(sendResponse);
            // The callback of onMessage should return a literal true value (documentation) in order to keep the internal messaging channel open so that sendResponse can work asynchronously.
            return true;
        }
        if (message.content === "requestTopics") {
            initTopicIds().then(sendResponse);
            // The callback of onMessage should return a literal true value (documentation) in order to keep the internal messaging channel open so that sendResponse can work asynchronously.
            return true;
        }
        if (message.content === "requestTopicDescriptions") {
            initTopicDescriptions().then(sendResponse);
            // The callback of onMessage should return a literal true value (documentation) in order to keep the internal messaging channel open so that sendResponse can work asynchronously.
            return true;
        }
        if (message.content === "checkSiteMounted") {
            // 通过chrome.tabs API获取当前活动标签页的window对象
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                const tabId = tabs?.[0]?.id;
                if (tabId) {
                    chrome.scripting.executeScript({
                        target: { tabId },
                        func: checkSiteMounted,
                        world: "MAIN"
                    }).then(injectionResults => {
                        sendResponse(!!injectionResults[0]?.result)
                    });
                }
            });
            return true;
        }
    }
});

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "update" && details.previousVersion) {
        if (details.previousVersion < "0.5.0") {
            chrome.storage.local.clear();
        } else if (details.previousVersion <= "0.7.0") {
            // 文章数据增加 status 字段
            batchSaveLocalStorage({
                [StorageKey.ARTICLE_LIST]: {},
                [StorageKey.ARTICLE_CONTENTS]: {},
                [StorageKey.ARTICLE_CACHE]: {},
            });
        }
    }
});


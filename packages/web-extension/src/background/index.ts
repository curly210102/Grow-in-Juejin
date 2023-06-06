import { extCode } from "@/constant"
import initArticleActivities from "@/core/clientRequests/initArticleActivities";
import initOtherActivities from "@/core/clientRequests/initOtherActivities";
import initPinActivities from "@/core/clientRequests/initPinActivities";
import { initTopicDescriptions, initTopicIds } from "@/core/clientRequests/initTopics";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.id === chrome.runtime.id && sender.origin === "https://juejin.cn" && message?.to === "Grow in Juejin Background" && message?.code === extCode) {
        if (message.content === "requestAllActivities") {
            Promise.all([initArticleActivities(), initPinActivities(), initOtherActivities()]).then((value) => {
                sendResponse({
                    article: value[0],
                    pin: value[1],
                    other: value[2]
                })
            })
            // The callback of onMessage should return a literal true value (documentation) in order to keep the internal messaging channel open so that sendResponse can work asynchronously.
            return true;
        }
        if (message.content === "requestArticleActivities") {
            initArticleActivities().then(sendResponse)
            // The callback of onMessage should return a literal true value (documentation) in order to keep the internal messaging channel open so that sendResponse can work asynchronously.
            return true;
        }
        if (message.content === "requestPinActivities") {
            initPinActivities().then(sendResponse)
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
    }
})

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "update" && (details.previousVersion && details.previousVersion < "0.5.0")) {
        chrome.storage.local.clear();
    }
});
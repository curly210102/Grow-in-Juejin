import { entryPath, extCode } from "@/constant"
import initActivities from "@/core/clientRequests/initActivities";
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: chrome.runtime.getURL(entryPath),
        active: true
    })
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.id === chrome.runtime.id && sender.origin === "https://juejin.cn" && message?.to === "Grow in Juejin Background" && message?.code === extCode) {
        if (message.content === "requestActivities") {
            initActivities().then(sendResponse);
            // The callback of onMessage should return a literal true value (documentation) in order to keep the internal messaging channel open so that sendResponse can work asynchronously.
            return true;
        }

    }
})
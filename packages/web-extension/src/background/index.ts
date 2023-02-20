import { entryPath } from "@/constant"
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: chrome.runtime.getURL(entryPath),
        active: true
    })
});
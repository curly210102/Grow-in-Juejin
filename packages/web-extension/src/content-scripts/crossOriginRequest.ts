import { extCode, frameURL } from "@/constant";
import initUserArticles from "@/core/clientRequests/initUserArticles";
import generateUniqueId from "@/core/utils/uniqueId";


export default async function crossOriginRequest() {
    // const res = await initUserArticles("2340192209345405", Infinity);
    // 1. 通过一些判断确定是 extension page 中的 iframe
    // 2. sendMessage 给 extension page
    // 3. extension page 接收到 message 拿到 tabId，进行通信
    if (window !== window.top && window.location.href === frameURL) {
        chrome.runtime.sendMessage({
            to: "Grow in Juejin",
            code: extCode,
            content: "Ready"
        })

        let syncLocked = false
        chrome.runtime.onMessage.addListener((message, sender) => {
            if (sender.id === chrome.runtime.id) {
                if (message.action === "sync") {
                    if (!syncLocked) {
                        (async () => {
                            const syncId = await chrome.runtime.sendMessage({
                                to: "Grow in Juejin",
                                code: extCode,
                                content: "Sync",
                            });

                            initUserArticles(message.userId, message.earliestTime).then(() => { syncLocked = false }).finally(() => {
                                chrome.runtime.sendMessage({
                                    to: "Grow in Juejin",
                                    code: extCode,
                                    content: "CompleteSync",
                                    syncId
                                })
                            })
                        })()
                    }
                }
            }

        })
    }
}

crossOriginRequest();
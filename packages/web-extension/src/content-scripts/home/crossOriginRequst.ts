import { extCode, frameURL } from "@/constant";
import initUserArticles from "@/core/clientRequests/initUserArticles";


export default async function () {
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
                console.log("enter")
                if (message.action === "sync") {
                    console.log("sync")
                    if (!syncLocked) {
                        initUserArticles(message.userId, message.earliestTime).then(() => { syncLocked = false })
                    }
                }
            }

        })
    }
}

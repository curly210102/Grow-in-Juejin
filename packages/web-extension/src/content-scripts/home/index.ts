import { extCode } from "@/constant";
import observeTheme from "./observeTheme";
import renderEntry from "./renderEntry"
import renderGlobalComponent from "./renderGlobalComponent";

if (!window.location.href.startsWith("https://juejin.cn/magic/eco/runtime/release")) {
    renderAfterSiteMounted();
    observeTheme();
}

function renderAfterSiteMounted() {
    chrome.runtime.sendMessage({
        to: "Grow in Juejin Background",
        code: extCode,
        content: "checkSiteMounted",
    }).then(isMounted => {
        if (isMounted) {
            renderEntry();
            renderGlobalComponent();
        }
    })
}


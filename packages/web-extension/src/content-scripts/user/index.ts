import { entryPath } from "@/constant";
import { entryIcon } from "../icon";



function getCurrentUserId() {
    const match = window.location.pathname.match(/\/user\/(\d+)/);
    return match ? match[1] : ""
}

function insertGrowEntry(userId: string) {
    const userNameEl = document.querySelector("#juejin > div.view-container > main > div.view.user-view > div.major-area > div.user-info-block.block.shadow > div.info-box.info-box > div.top > div.left > .username");
    if (userNameEl) {
        const growingEntry = document.createElement("div");
        growingEntry.style.display = "flex";
        growingEntry.style.alignItems = "center";
        growingEntry.style.marginLeft = "8px";
        growingEntry.innerHTML = `<a href="${chrome.runtime.getURL(entryPath)}?userId=${userId}" target="__blank" title="Grow in Juejin" style="width:18px;height:18px;display:inline-block">${entryIcon}</a>`;
        userNameEl.insertAdjacentElement("afterend", growingEntry)
    }
}


const userId = getCurrentUserId();
if (userId) {
    insertGrowEntry(userId);
}
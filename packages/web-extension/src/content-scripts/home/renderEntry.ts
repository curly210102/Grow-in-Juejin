import { entryPath } from "@/constant";
import { getCurrentUserId } from "../utils/getInformation";
import { entryIcon } from "../icon";
import onRouteChange from "../utils/onRouteChange";

function addNavbarEntry() {
    const notificationEntry = document.querySelector("#juejin > div.view-container > div > header > div > nav > ul > ul > li.nav-item.notification");
    if (notificationEntry) {
        const growingEntry = notificationEntry.cloneNode() as Element;
        growingEntry.classList.remove("notification");
        growingEntry.innerHTML = `<a href="${chrome.runtime.getURL(entryPath)}" target="__blank" title="Grow in Juejin" style="width: 22px; height: 22px; color: #8a919f">${entryIcon}</a>`;
        notificationEntry.insertAdjacentElement("beforebegin", growingEntry);
    }
}

function addUserProfileEntry() {
    const userId = getCurrentUserId();
    if (userId) {
        const userNameEl = document.querySelector("#juejin > div.view-container > main > div.view.user-view > div.major-area > div.user-info-block.block.shadow > div.info-box.info-box > div.top > div.left > .username");
        if (userNameEl) {
            const growingEntry = document.createElement("div");
            growingEntry.style.display = "flex";
            growingEntry.style.alignItems = "center";
            growingEntry.style.marginLeft = "8px";
            growingEntry.innerHTML = `<a href="${chrome.runtime.getURL(entryPath)}?userId=${userId}" target="__blank" title="Grow in Juejin" style="width:18px;height:18px;display:inline-block">${entryIcon}</a>`;
            userNameEl.insertAdjacentElement("afterend", growingEntry)
        } else {
            setTimeout(addUserProfileEntry, 1000)
        }
    }

}


export default function renderEntryIcon() {
    addNavbarEntry();
    onRouteChange(function () {
        addNavbarEntry();
    });
}


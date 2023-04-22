import { entryPath } from "@/constant";
import { entryIcon } from "../icon";
import onRouteChange from "../utils/onRouteChange";

function addNavbarEntry() {
    const oldEntry = document.getElementById("entry-gij");
    if (oldEntry) {
        oldEntry.remove();
    }
    const notificationEntry = document.querySelector("#juejin > div.view-container > div > header > div > nav > ul > ul > li.nav-item.notification");
    if (notificationEntry) {
        const growingEntry = notificationEntry.cloneNode() as Element;
        growingEntry.id = "entry-gij"
        growingEntry.classList.remove("notification");
        growingEntry.innerHTML = `<a href="${chrome.runtime.getURL(entryPath)}" target="__blank" title="Grow in Juejin" style="width: 22px; height: 22px; color: #8a919f">${entryIcon}</a>`;
        notificationEntry.insertAdjacentElement("beforebegin", growingEntry);
    }
}


export default function renderEntryIcon() {
    addNavbarEntry();
    onRouteChange(function () {
        addNavbarEntry();
    });
}


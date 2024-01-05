import { entryPath } from "@/constant";
import { entryIcon } from "@/icon";
import onRouteChange from "../utils/onRouteChange";
import onElementRendered from "../utils/onElementRendered";

async function addNavbarEntry() {
    const oldEntry = document.getElementById("entry-gij");
    if (oldEntry) {
        oldEntry.remove();
    }
    const notificationEntry = await onElementRendered("#juejin > div.view-container > div > header > div > nav > ul > ul > li.nav-item.notification");
    if (notificationEntry) {
        const growingEntry = notificationEntry.cloneNode() as HTMLElement;
        growingEntry.id = "entry-gij"
        growingEntry.classList.remove("notification");
        growingEntry.style.padding = "0 0.5rem";
        growingEntry.innerHTML = `<a href="${chrome.runtime.getURL(entryPath)}" target="__blank" title="Grow in Juejin" style="width: 22px; height: 22px;">${entryIcon}</a>`;
        notificationEntry.insertAdjacentElement("beforebegin", growingEntry);
    }
}


export default function renderEntryIcon() {
    addNavbarEntry();
    onRouteChange(function () {
        addNavbarEntry();
    });
}


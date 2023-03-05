import { entryPath } from "@/constant";
import { entryIcon } from "../icon";


export default function renderEntryIcon() {

    const GROW_ICON = entryIcon;

    function onRouteChange(callback: () => void) {
        const root = document.querySelector("#juejin");
        let oldViewContainer = document.querySelector("#juejin > div.view-container");
        if (root) {
            const observer = new MutationObserver(function () {
                const currentViewContainer = document.querySelector("#juejin > div.view-container");
                if (oldViewContainer !== currentViewContainer) {
                    callback();
                    oldViewContainer = currentViewContainer;
                }
            })
            observer.observe(root, { childList: true });
        }
    }

    function addGrowingEntry() {
        const notificationEntry = document.querySelector("#juejin > div.view-container > div > header > div > nav > ul > ul > li.nav-item.notification");
        if (notificationEntry) {
            const growingEntry = notificationEntry.cloneNode() as Element;
            growingEntry.classList.remove("notification");
            growingEntry.innerHTML = `<a href="${chrome.runtime.getURL(entryPath)}" target="__blank" title="Grow in Juejin" style="width: 22px; height: 22px; color: #8a919f">${GROW_ICON}</a>`;
            notificationEntry.insertAdjacentElement("beforebegin", growingEntry);
        }
    }

    addGrowingEntry();
    onRouteChange(addGrowingEntry)

}


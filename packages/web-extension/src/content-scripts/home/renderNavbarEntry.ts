import { entryPath } from "@/constant";

export default function renderEntryIcon() {

    const GROW_ICON = `<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 10L32 38H4L18 10Z" fill="#8a919f" stroke="#8a919f" stroke-width="4" stroke-linejoin="round"/><path d="M28 29L33.6471 22L44 38H32" stroke="#8a919f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22L24 22" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 18L10 26" stroke="#8a919f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 18L26 26" stroke="#8a919f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`

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
            growingEntry.innerHTML = `<a href="${chrome.runtime.getURL(entryPath)}" target="__blank" title="Grow in Juejin">${GROW_ICON}</a>`;
            notificationEntry.insertAdjacentElement("beforebegin", growingEntry);
        }
    }

    addGrowingEntry();
    onRouteChange(addGrowingEntry)

}


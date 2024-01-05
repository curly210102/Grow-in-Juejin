export default function onRouteChange(callback: () => void) {
    const root = document.querySelector("#juejin");
    let oldView = document.querySelector("#juejin > div.view-container");
    let oldUserView = document.querySelector("#juejin > div.view-container .user-view");
    if (root) {
        const observer = new MutationObserver(function (mutationList) {
            for (const mutation of mutationList) {
                if (mutation.type === "childList") {
                    const currentView = document.querySelector("#juejin > div.view-container");
                    const currentUserView = document.querySelector("#juejin > div.view-container .user-view");
                    if (oldView !== currentView || oldUserView !== currentUserView) {
                        callback();
                        oldView = currentView;
                        oldUserView = currentUserView;
                        break;
                    }
                }
            }
        })
        observer.observe(root, { childList: true, subtree: true });
    }
}
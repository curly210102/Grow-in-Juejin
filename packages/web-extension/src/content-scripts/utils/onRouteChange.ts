export default function onRouteChange(callback: () => void) {
    const root = document.querySelector("#juejin");
    let oldUserView = document.querySelector("#juejin > div.view-container .user-view");
    if (root) {
        const observer = new MutationObserver(function (mutationList) {
            for (const mutation of mutationList) {
                if (mutation.type === "childList") {
                    const currentUserView = document.querySelector("#juejin > div.view-container .user-view");
                    if (oldUserView !== currentUserView) {
                        callback();
                        oldUserView = currentUserView;
                        break;
                    }
                }
              }
        })
        observer.observe(root, { childList: true, subtree: true });
    }
}
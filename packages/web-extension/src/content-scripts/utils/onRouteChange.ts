export default function onRouteChange(callback: () => void) {
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
import observeTheme from "./observeTheme";
import renderEntry from "./renderEntry"
import renderGlobalComponent from "./renderGlobalComponent";

if (!window.location.href.startsWith("https://juejin.cn/magic/eco/runtime/release")) {
    renderEntry();
    renderGlobalComponent();
    observeTheme();
}


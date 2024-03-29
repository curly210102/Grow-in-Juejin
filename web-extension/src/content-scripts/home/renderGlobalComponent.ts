import onRouteChange from "../utils/onRouteChange";
import { CustomActivityFloating, register } from "./components";

register();

function addActivityFloating() {
    const element = document.createElement("div");
    element.append(new CustomActivityFloating());
    element.style.position = "fixed";
    element.style.right = "0px";
    element.style.top = "80px";
    element.style.zIndex = "999";
    document.body.append(element);
}

export default function renderGlobalComponent() {
    addActivityFloating();
    onRouteChange(function () {
        if (!document.querySelector("gij-floating-activity")) {
            addActivityFloating();
        }
    });
}


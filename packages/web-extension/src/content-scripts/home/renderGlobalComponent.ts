import { CustomActivityOngoing, CustomActivityJoint, register } from "./components";

register();

function addOngoingActivity () {
    const element = document.createElement("div");
    element.append(new CustomActivityOngoing());
    element.append(new CustomActivityJoint({
        style: "margin-top: 12px"
    }));
    element.style.position="fixed";
    element.style.right = "0px";
    element.style.top = "80px";
    document.body.append(element);
}

export default function renderGlobalComponent() {
    addOngoingActivity();
    
}


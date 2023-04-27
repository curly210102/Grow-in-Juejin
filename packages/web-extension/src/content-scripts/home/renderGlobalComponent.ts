import { CustomActivityOngoing, register } from "./components";

register();

function addOngoingActivity () {
    const element = document.createElement("div");
    element.append(new CustomActivityOngoing());
    document.body.append(element);
}

export default function renderGlobalComponent() {
    addOngoingActivity();
    
}


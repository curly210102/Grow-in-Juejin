export default async function onElementRendered(selector: string, timeout: number = 60 * 1000) {
    let element = document.querySelector(selector);
    let pollingTimes = Math.floor(timeout / 1000);

    while (!element && pollingTimes) {
        await (new Promise(resolve => setTimeout(resolve, 1000)));
        element = document.querySelector(selector);
        pollingTimes--;
    }

    return element as HTMLElement;
}
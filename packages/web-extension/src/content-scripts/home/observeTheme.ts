import { StorageKey } from "@/core/types";
import { loadLocalStorage, saveLocalStorage } from "@/core/utils/storage";

export default function observeTheme() {
    const targetNode = document.body;
    loadLocalStorage(StorageKey.THEME).then((localTheme) => {
        if (localTheme !== targetNode.dataset.theme) {
            saveLocalStorage(StorageKey.THEME, targetNode.dataset.theme);
        }
    })
    // Create a new MutationObserver and specify a callback function
    const observer = new MutationObserver((mutationsList) => {
        // Iterate through the list of mutations
        for (const mutation of mutationsList) {
            // Check if the dataset property was modified
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                // Log the new value of the dataset property
                saveLocalStorage(StorageKey.THEME, targetNode.dataset.theme);
            }
        }
    });
    // Start observing the target element for attribute changes
    observer.observe(targetNode, { attributes: true });
}
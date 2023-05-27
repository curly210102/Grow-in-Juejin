import { onMounted, onUnmounted, ref } from "vue";

export default function useIsDarkMode() {

    let observer: MutationObserver | null = null;
    const isDarkMode = ref(false);
    onMounted(() => {
        const targetNode = document.body;
        const currentMode = targetNode.dataset.theme;
        isDarkMode.value = currentMode === "dark";

        // Create a new MutationObserver and specify a callback function
        observer = new MutationObserver((mutationsList) => {
            // Iterate through the list of mutations
            for (const mutation of mutationsList) {
                // Check if the dataset property was modified
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    // Log the new value of the dataset property
                    const currentMode = targetNode.dataset.theme;
                    isDarkMode.value = currentMode === "dark";
                }
            }
        });
        // Start observing the target element for attribute changes
        observer.observe(targetNode, { attributes: true });
    })


    onUnmounted(() => {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    })

    return isDarkMode;
}
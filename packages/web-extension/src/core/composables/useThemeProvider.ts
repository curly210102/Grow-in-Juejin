import { StorageKey } from "@/core/types";
import { loadLocalStorage } from "@/core/utils/storage";
import { provide, ref } from "vue";
import { IThemeInjectionContentType, themeInjectionKey } from "../utils/injectionKeys";

export default function useThemeProvider() {
    const theme = ref<IThemeInjectionContentType>("light");


    loadLocalStorage(StorageKey.THEME).then((value) => {
        theme.value = value ?? "light"
    });

    chrome.storage.local.onChanged.addListener((changes) => {
        if (changes[StorageKey.THEME]) {
            theme.value = changes[StorageKey.THEME].newValue ?? {}
        }

    })

    provide(themeInjectionKey, theme);

    return theme
}
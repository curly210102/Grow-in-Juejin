import { computed, inject, ref } from "vue";
import { themeInjectionKey } from "../utils/injectionKeys";

export default function useIsDarkMode() {
    const theme = inject(themeInjectionKey, ref("light"));

    return computed(() => theme.value === "dark");
}
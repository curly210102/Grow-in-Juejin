import { Preferences, StorageKey } from "@/core/types";
import { loadLocalStorage } from "@/core/utils/storage";
import { onMounted, ref } from "vue";

export default function useClientPreferences () {
    const preferences = ref<Preferences>({});


    onMounted(() => {
        loadLocalStorage(StorageKey.PREFERENCE).then((value) => {
            preferences.value = value ?? {}
        });

        chrome.storage.local.onChanged.addListener((changes) => {
            if (changes[StorageKey.PREFERENCE]) {
                preferences.value = changes[StorageKey.PREFERENCE].newValue ?? {}
            }
            
        })
    })

    return preferences;
}
import { PreferenceKey, PreferenceValue, Preferences, StorageKey } from "@/core/types";
import { loadLocalStorage } from "@/core/utils/storage";
import { onMounted, ref } from "vue";

export default function useClientPreferences() {
    const preferences = ref<Preferences>({});


    loadLocalStorage(StorageKey.PREFERENCE).then((value) => {
        preferences.value = Object.assign({
            [PreferenceKey.CONTRIBUTION_OF_MINE]: PreferenceValue.SHOW,
            [PreferenceKey.CONTRIBUTION_OF_OTHERS]: PreferenceValue.SHOW,
            [PreferenceKey.TRENDING_OF_MINE]: PreferenceValue.SHOW,
            [PreferenceKey.TRENDING_OF_OTHERS]: PreferenceValue.SHOW,
            [PreferenceKey.ACTIVITIES_OF_MINE]: PreferenceValue.SHOW,
            [PreferenceKey.BADGE_OF_NEW_ACTIVITY]: true
        }, value ?? {})
    });

    chrome.storage.local.onChanged.addListener((changes) => {
        if (changes[StorageKey.PREFERENCE]) {
            preferences.value = changes[StorageKey.PREFERENCE].newValue ?? {}
        }

    })

    return preferences;
}
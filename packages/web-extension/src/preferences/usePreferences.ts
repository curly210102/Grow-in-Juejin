
import { PreferenceKey, PreferenceValue, Preferences, StorageKey } from "@/core/types";
import { loadLocalStorage, saveLocalStorage } from "@/core/utils/storage";
import { onMounted, reactive, watch } from "vue";


const initialPreferences = {
    [PreferenceKey.BADGE_OF_NEW_ACTIVITY]: true
}

export default function usePreferences () {
    const preferences = reactive<Preferences>(initialPreferences);


    onMounted(() => {
        loadLocalStorage(StorageKey.PREFERENCE).then((value) => {
             Object.assign(preferences, value)
        });
    })

    watch(preferences, (v) => {
        saveLocalStorage(StorageKey.PREFERENCE, v);
    })

    function updatePreference (key: PreferenceKey, value: PreferenceValue | boolean) {
        preferences[key] = value;
    }

    return [preferences, updatePreference] as [Preferences, (a: PreferenceKey, b: PreferenceValue | boolean) => void]
}
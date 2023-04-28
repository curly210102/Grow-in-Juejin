
import { PersistenceState, StorageKey } from "@/core/types";
import { loadLocalStorage, saveLocalStorage } from "@/core/utils/storage";
import { onMounted, reactive } from "vue";



export default function usePersistenceState () {
    const state = reactive<PersistenceState>({
        "lastVisitedActivityTime": 0
    });

    onMounted(() => {
        loadLocalStorage(StorageKey.PERSISTENCE_STATE).then((value) => {
             Object.assign(state, value)
        });
    })


    function setState (key: keyof PersistenceState, value: PersistenceState[keyof PersistenceState]) {
        state[key] = value;
        saveLocalStorage(StorageKey.PERSISTENCE_STATE, state);
    }


    return {
        state,
        setState
    }
}
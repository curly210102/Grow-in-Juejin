import { ref } from "vue";
import { IActivity } from "../types";
import { fetchActivities } from "../utils/api";


export default async function useFetchActivities() {
    const activities = ref<Array<IActivity>>([]);

    fetchActivities().then(data => activities.value = data);

    return activities
}

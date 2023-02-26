<script lang="ts" setup>
const activities = useFetchActivities()


</script>
<script lang='ts'>

import ActivityOngoing from "./ActivityOngoing.vue";
import ActivityJoined from "./ActivityJoined.vue";
import useFetchActivities from "../composables/useFetchActivities";

export default {

    components: {
        ActivityOngoing,
        ActivityJoined
    }
}

</script>
<template>
    <div class="space-y-8">
        <div>
            <ActivityOngoing :items="activities" />
        </div>
        <div>
            <ActivityJoined />
        </div>
    </div>
</template>
<script lang='ts' setup>
import useFetchUserDailyActions from '../composables/useFetchUserDailyActions';
import UserContribution from './UserContribution.vue';
import UserGrowTrending from './UserGrowTrending.vue';


const dailyActions = useFetchUserDailyActions();


</script>

<template>
    <div class="space-y-8">
        <div>
            <UserContribution :actions="dailyActions" bodyClass="shadow-card rounded-lg" />
        </div>
        <div>
            <UserGrowTrending />
        </div>
    </div>
</template>
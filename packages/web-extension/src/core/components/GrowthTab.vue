<script lang='ts' setup>
import useFetchUserDailyActions from '../composables/useFetchUserDailyActions';
import UserContribution from './UserContribution.vue';


const dailyActions = useFetchUserDailyActions();


</script>

<template>
    <div>
        <UserContribution :actions="dailyActions" bodyClass="shadow-card rounded-lg" />
    </div>
</template>
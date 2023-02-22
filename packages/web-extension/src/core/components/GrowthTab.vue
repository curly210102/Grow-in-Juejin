<script lang='ts' setup>
import useFetchUserDailyActions from '../composables/useFetchUserDailyActions';
import UserContribution from './UserContribution.vue';

const { dailyActions } = useFetchUserDailyActions();
</script>

<template>
    <div class="shadow-card rounded-lg">
        <UserContribution :actions="dailyActions" />
    </div>
</template>
<script lang='ts' setup>
import { time as chartTime } from "echarts";

import { computed, inject, ref, unref, watch, watchEffect } from "vue";
import { ActionType, UserActions } from "../types";
import calculateContribution from "../utils/calculateContribution";
import { addOneYear, getFullYearRange, getLastYearRange, MS_OF_DAY } from "../utils/date";
import SectionHeader from "../base-components/SectionHeader.vue"
import Heatmap from "../base-components/Heatmap.vue"
import Select, { Item } from "../base-components/Select.vue"
import { getYear } from '../utils/date';
import useFetchUserDailyActions from "../composables/useFetchUserDailyActions";
import { userInjectionKey } from "../utils/injectionKeys";


const props = defineProps<{
    bodyClass?: string,
    headerClass?: string,
    hideSummation?: boolean
}>();

const RECENT_ITEM = {
    key: "lastYear",
    text: "过去一年"
}

const selected = ref<Item>(RECENT_ITEM);
const range = computed(() => {
    const selectedKey = selected.value.key;
    if (selectedKey === "lastYear") {
        return getLastYearRange();
    } else {
        return getFullYearRange(+selectedKey)
    }
})


const userId = inject(userInjectionKey, ref(""));
const {
    dailyActions: actions,
    earliestYear,
    syncing
} = useFetchUserDailyActions(userId, range);


const { headerClass } = props;


const rangeItems = computed<Item[]>(() => {
    const items: Item[] = [RECENT_ITEM]
    const thisYear = getYear();
    const pioneerYear = earliestYear.value;
    for (let year = thisYear; year >= pioneerYear; year--) {
        items.push({
            key: year,
            text: `${year}`
        })
    }

    return items;
});



watch(rangeItems, (rangeItems) => {
    if (!rangeItems.includes(selected.value)) {
        const selectedKey = selected.value.key;
        selected.value = rangeItems.find(range => range.key === selectedKey) ?? rangeItems[0];
    }
})


type ActionOverview = {
    dateText: string,
    total: number,
    score?: number,
    actions: UserActions
}
const dailyContribution = ref<Array<[string, number]>>([]);
const rangeActionSummation = ref<ActionOverview | null>(null);
watchEffect(() => {
    const isRange = range.value[0] !== range.value[1]
    const startDate = range.value[0];
    const endDate = !isRange ? range.value[1] : addOneYear(startDate);

    const dailyActions = unref(actions);
    const dailyContributionValue: [string, number][] = [];
    const totalActions = {
        [ActionType.POST]: 0,
        [ActionType.LKPOST]: 0,
        [ActionType.PIN]: 0,
        [ActionType.LKPIN]: 0,
        [ActionType.FOLLOW]: 0,
    };
    let totalActionCount = 0;
    for (let time = startDate; time <= endDate; time += MS_OF_DAY) {
        if (dailyActions[time]) {
            dailyContributionValue.push([
                chartTime.format(time, '{yyyy}-{MM}-{dd}', false),
                calculateContribution(dailyActions[time])
            ]);
            Object.keys(dailyActions[time]).forEach((actionTypeKey) => {
                const actionType = +actionTypeKey as ActionType;
                if (actionType in totalActions) {
                    totalActions[actionType] += (dailyActions[time][actionType] ?? 0);
                    totalActionCount += (dailyActions[time][actionType] ?? 0);
                }

            })
        } else {
            dailyContributionValue.push([chartTime.format(time, '{yyyy}-{MM}-{dd}', false), 0]);
        }
    }
    dailyContribution.value = dailyContributionValue;
    rangeActionSummation.value = {
        dateText: isRange ? `${chartTime.format(range.value[0], '{yyyy}-{MM}-{dd}', false)} - ${chartTime.format(range.value[1], '{yyyy}-{MM}-{dd}', false)}` : chartTime.format(range.value[0], '{yyyy}-{MM}-{dd}', false),
        total: totalActionCount,
        actions: totalActions
    }
})

const selectedIndex = ref(-1);
const selectedDailyActionSummation = computed(() => {
    const selectedItem = dailyContribution.value[selectedIndex.value];
    if (selectedItem) {
        const time = chartTime.parse(selectedItem[0]).valueOf();
        const actionOfDay = actions.value;
        return {
            dateText: chartTime.format(time, "{yyyy}-{MM}-{dd} {eeee}", false, "ZH"),
            actions: actionOfDay[time] ?? {},
            total: Object.values(actionOfDay[time] ?? {}).reduce((sum, num) => sum + (num ?? 0), 0),
            score: selectedItem[1]
        };
    }
    return null;
})

const dailyActionSummation = computed(() => selectedDailyActionSummation.value ?? rangeActionSummation.value);

const echartsRange = computed(() => {
    return [`${chartTime.format(range.value[0], '{yyyy}-{MM}-{dd}', false)}`, `${chartTime.format(range.value[1], '{yyyy}-{MM}-{dd}', false)}`];
})



</script>
<template>
    <SectionHeader :class="headerClass" title="社区活跃度">
        <div class="w-28">
            <Select :items="rangeItems" v-model="selected" />
        </div>
    </SectionHeader>
    <div class="bg-white shadow-card rounded-lg">
        <div class="p-3">
            <Heatmap :data="dailyContribution" :range="echartsRange" :onSelect="(index: number) => selectedIndex = index"
                :loading="syncing" />
        </div>
        <div class="bg-gray-100 border border-t-0 rounded-b-lg shadow-inner pb-5 pt-4 px-8"
            v-if="dailyActionSummation && !hideSummation">
            <p class="text-sm text-slate-500">
                {{ dailyActionSummation.dateText }}，产生 {{ dailyActionSummation.total }} 个贡献
                <template v-if="dailyActionSummation.score">
                    ，活跃度 {{ dailyActionSummation.score }}
                </template>
            </p>
            <hr class="divider mt-2 mb-3" />
            <div class="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div>
                    🚀 发布 <strong>{{ dailyActionSummation.actions[ActionType.POST] ?? 0 }}</strong> 篇文章
                </div>
                <div>
                    📣 发布 <strong>{{ dailyActionSummation.actions[ActionType.PIN] ?? 0 }}</strong> 条沸点
                </div>
                <div>
                    😀 关注 <strong>{{ dailyActionSummation.actions[ActionType.FOLLOW] ?? 0 }}</strong> 个掘友
                </div>
                <div>
                    👍 送出 <strong>{{ (dailyActionSummation.actions[ActionType.LKPOST]) ?? 0
                    }}</strong> 个赞
                </div>
                <div>
                    👏 赞同 <strong>{{ (dailyActionSummation.actions[ActionType.LKPIN] ?? 0) ?? 0
                    }}</strong> 条沸点

                </div>

            </div>
        </div>
    </div>
</template>

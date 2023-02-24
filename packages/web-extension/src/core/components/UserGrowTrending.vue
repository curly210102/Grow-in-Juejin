<script lang='ts' setup>
import { computed, ref, toRef, watch } from "vue";
import RadioSelect from "../base-components/RadioSelect.vue";
import SectionHeader from "../base-components/SectionHeader.vue"
import VChart from "vue-echarts";
import { ActionType, IDailyActions } from "@/types";
import { getYear } from "../utils/date";
import colors from "tailwindcss/colors";
import { EChartsOption } from "echarts";
import { LineSeriesOption } from "echarts/charts";

const unitItems = [
    { key: 'week', text: "周" },
    { key: "month", text: "月" },
    { key: "year", text: "年" }
]
const unit = ref(unitItems[2]);

const props = defineProps<{
    actions: IDailyActions
}>()
const actions = toRef(props, "actions");

const data = computed(() => {
    const record: Record<number, number> = {};
    if (unit.value.key === "week") {
        for (const date in actions.value) {
            const year = getYear(+date);
            const key = year;
            const postCount = actions.value[date][ActionType.POST];
            if (key in record) {
                record[key] += postCount;
            } else {
                record[key] = postCount
            }
        }
    }
    else if (unit.value.key === "month") {
        for (const date in actions.value) {
            const year = getYear(+date);
            const key = year;
            const postCount = actions.value[date][ActionType.POST];
            if (key in record) {
                record[key] += postCount;
            } else {
                record[key] = postCount
            }
        }
    }
    else if (unit.value.key === "year") {
        for (const date in actions.value) {
            const year = getYear(+date);
            const key = year;
            const postCount = actions.value[date][ActionType.POST];
            if (key in record) {
                record[key] += postCount;
            } else {
                record[key] = postCount
            }
        }
    }

    const data = Object.entries(record).sort(([date1], [date2]) => +date1 - +date2)
    data.forEach((item, index) => {
        if (index > 0) {
            item[1] += data[index - 1][1]
        }
    });

    return data;
});


type Option = EChartsOption & {
    series: LineSeriesOption
};

const option = computed<Option>(() => ({
    tooltip: {
        enterable: true,
        confine: true,
        padding: [4, 4, 2],
        textStyle: {
            fontSize: 12
        },
        position(point, _params, _dom) {
            return [point[0], "20%"];
        },
        formatter(params: any) {
            return `${params[0].data[0]}｜<strong>${params[0].data[1]}</strong>`
        }
    },
    grid: {
        top: 30,
        left: 30,
        right: 20,
        bottom: 30
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        axisPointer: {
            show: true,
            type: "shadow"
        },
        axisLabel: {
            color: colors.slate[400],
        },
        axisTick: {
            show: false
        },
        axisLine: {
            show: false
        }
    },
    yAxis: {
        type: 'value',
        splitLine: {
            show: false
        },
        axisLabel: {
            color: colors.slate[400]
        },
        name: "发文总量",
        nameLocation: "end",
        nameTextStyle: {
            color: colors.slate[400],
        }
    },
    series: [
        {
            data: data.value,
            symbol: "emptyCircle",
            type: 'line',
            lineStyle: {
                color: colors.blue[500],
                width: 3
            },
            emphasis: {
                disabled: true
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                        {
                            offset: 0,
                            color: colors.blue[500]
                        },
                        {
                            offset: 0.8,
                            color: colors.blue[200]
                        },
                        {
                            offset: 1,
                            color: colors.gray[100]
                        }
                    ],
                    global: false // default is false
                }
            },
            smooth: true
        }
    ],
}));

</script>
<template>
    <SectionHeader title="成长之路">
        <RadioSelect :items="unitItems" v-model="unit" />
    </SectionHeader>
    <div class="card">
        <v-chart :option="option" class="h-56" />
    </div>
</template>
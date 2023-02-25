<script lang='ts' setup>
import { computed, ref, toRef, watch } from "vue";
import RadioSelect from "../base-components/RadioSelect.vue";
import SectionHeader from "../base-components/SectionHeader.vue"
import VChart from "vue-echarts";
import { ActionType, IDailyActions } from "@/types";
import { daysOfMonth, getDate, getMonth, getYear, startOfYear, startOfMonth, prevYear, prevMonth, nextMonth, nextYear } from "../utils/date";
import colors from "tailwindcss/colors";
import { EChartsOption } from "echarts";
import { LineSeriesOption } from "echarts/charts";
import { time } from "echarts/core";

const props = defineProps<{
    actions: IDailyActions
}>()
const actions = toRef(props, "actions");


const unitItems = [
    { key: "year", text: "年" },
    { key: "month", text: "月" },
    { key: 'day', text: "日" },

]
const unit = ref(unitItems[0]);
const currentRange = ref<number>(new Date().valueOf());

watch(unit, (value, oldValue) => {
    if (value.key !== oldValue.key) {
        if (value.key === "year") {
            currentRange.value = new Date().valueOf();
        } else if (value.key === "month") {
            currentRange.value = startOfYear(currentRange.value);

        } else if (value.key === "day") {
            currentRange.value = startOfMonth(currentRange.value);
        }
    }
})

const data = computed(() => {
    const record: Record<number, number> = {};
    if (unit.value.key === "year") {
        for (const date in actions.value) {
            const postCount = actions.value[date][ActionType.POST];
            if (postCount) {
                const year = getYear(+date);
                const key = year;
                if (key in record) {
                    record[key] += postCount;
                } else {
                    record[key] = postCount
                }
            }
        }
    }
    else if (unit.value.key === "month") {
        for (let i = 1; i <= 12; i++) {
            record[i] = 0;
        }
        for (const date in actions.value) {
            if (startOfYear(+date) === currentRange.value) {
                const month = getMonth(+date);
                const key = month;
                const postCount = actions.value[date][ActionType.POST];
                if (key in record) {
                    record[key] += postCount;
                } else {
                    record[key] = postCount
                }
            }
        }
    }
    else if (unit.value.key === "day") {
        const days = daysOfMonth(currentRange.value);
        for (let i = 1; i <= days; i++) {
            record[i] = 0;
        }
        for (const time in actions.value) {
            if (currentRange.value === startOfMonth(+time)) {
                const date = getDate(+time);
                const key = date;
                const postCount = actions.value[time][ActionType.POST];
                if (key in record) {
                    record[key] += postCount;
                } else {
                    record[key] = postCount
                }
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
            const param = Array.isArray(params) ? params[0] : params;
            return `${param.data[0]}｜<strong>${param.data[1]}</strong>`
        }
    },
    grid: {
        top: 30,
        left: unit.value.key === "day" ? 50 : unit.value.key === "month" ? 40 : 30,
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
            formatter: unit.value.key === "month" ? '{value}月' : '{value}'
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
            lineStyle: {
                type: "dotted"
            }
        },
        axisLabel: {
            color: colors.slate[400]
        },
        name: unit.value.key === "year" ? "发文总量" : `${time.format(currentRange.value, unit.value.key === "month" ? `{yyyy}` : `{yyyy}-{MM}`, false) ?? ""} 发文总量`,
        nameLocation: "end",
        nameTextStyle: {
            color: colors.slate[400],
        },
        minInterval: 1
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
    graphic: unit.value.key === "year" ? [] : [{
        type: "group",
        top: "middle",
        left: 0,
        children: [{
            id: 'left_flip',
            type: 'circle',
            shape: {
                cx: 0,
                cy: 0,
                r: 10,
            },
            z: 50,

            style: {
                fill: colors["white"],
                stroke: colors["gray"]["200"],
                lineWidth: 1,
            },
        },
        {
            type: "text",
            style: {
                fill: colors.gray["600"],
                text: "⬅︎",
                x: -5.5,
            },
            z: 100,
            top: "middle"
        }],
        onclick() {
            if (unit.value.key === "month") {
                currentRange.value = prevYear(currentRange.value);
            } else if (unit.value.key === "day") {
                currentRange.value = prevMonth(currentRange.value);
            }
        }
    }, {
        type: "group",
        top: "middle",
        right: 0,
        children: [{
            id: 'right_flip',
            type: 'circle',
            shape: {
                cx: 0,
                cy: 0,
                r: 10,
            },
            z: 50,
            style: {
                fill: colors["white"],
                stroke: colors["gray"]["200"],
                lineWidth: 1,
            },
        },
        {
            type: "text",
            style: {
                fill: colors.gray["600"],
                text: "➡︎",
                x: -5.5,
            },
            z: 100,
            top: "middle"
        }],
        onclick() {
            if (unit.value.key === "month") {
                currentRange.value = nextYear(currentRange.value);
            } else if (unit.value.key === "day") {
                currentRange.value = nextMonth(currentRange.value);
            }
        }
    }]
}));




</script>
<template>
    <SectionHeader title="成长之路">
        <RadioSelect :items="unitItems" v-model="unit" />
    </SectionHeader>
    <div class="card relative">
        <v-chart :option="option" class="h-56" />
    </div>
</template>
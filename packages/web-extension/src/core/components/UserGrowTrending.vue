<script lang='ts' setup>
import { computed, inject, ref, watch } from "vue";
import RadioSelect from "../base-components/RadioSelect.vue";
import SectionHeader from "../base-components/SectionHeader.vue"
import VChart from "vue-echarts";
import { daysOfMonth, getDate, getMonth, getYear, startOfYear, startOfMonth, prevYear, prevMonth, nextMonth, nextYear, startOfDate } from "../utils/date";
import colors from "tailwindcss/colors";
import { EChartsOption } from "echarts";
import { LineSeriesOption, LineChart } from "echarts/charts";
import { time, use } from "echarts/core";
import { articleListInjectionKey, IArticleListInjectContentType } from "../utils/injectionKeys";
import { CanvasRenderer } from "echarts/renderers";
import { GraphicComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";

use([
    CanvasRenderer,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    LineChart,
    GridComponent,
    GraphicComponent
]);


const articleList = inject<IArticleListInjectContentType>(articleListInjectionKey, ref([]))

const dailyCountMap = computed(() => {
    const dailyCountMap = new Map<number, number>();
    articleList.value.forEach(({ publishTime }) => {
        const date = startOfDate(publishTime);
        const currentCount = dailyCountMap.get(date);
        if (currentCount) {
            dailyCountMap.set(date, currentCount + 1);
        } else {
            dailyCountMap.set(date, 1);
        }
    })
    return dailyCountMap;
})


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
            currentRange.value = startOfMonth(startOfYear(currentRange.value) === startOfYear(new Date().valueOf()) ? new Date().valueOf() : currentRange.value);
        }
    }
})

const data = computed(() => {
    const record: Record<number, number> = {};
    if (unit.value.key === "year") {
        dailyCountMap.value.forEach((count, date) => {
            const key = getYear(date);
            if (key in record) {
                record[key] += count;
            } else {
                record[key] = count
            }
        })
    }
    else if (unit.value.key === "month") {
        for (let i = 1; i <= 12; i++) {
            record[i] = 0;
        }
        dailyCountMap.value.forEach((count, date) => {
            if (startOfYear(date) === currentRange.value) {
                const key = getMonth(date);
                if (key in record) {
                    record[key] += count;
                } else {
                    record[key] = count
                }
            }
        })

    }
    else if (unit.value.key === "day") {
        const days = daysOfMonth(currentRange.value);
        for (let i = 1; i <= days; i++) {
            record[i] = 0;
        }

        dailyCountMap.value.forEach((count, date) => {
            if (currentRange.value === startOfMonth(date)) {
                const key = getDate(date);
                if (key in record) {
                    record[key] += count;
                } else {
                    record[key] = count;
                }
            }
        })
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
    <template v-if="articleList.length">
        <SectionHeader title="成长之路">
            <RadioSelect :items="unitItems" v-model="unit" />
        </SectionHeader>
        <div class="card relative">
            <v-chart :option="option" autoresize class="h-56 block min-w-0 w-full" />
        </div>
    </template>
</template>
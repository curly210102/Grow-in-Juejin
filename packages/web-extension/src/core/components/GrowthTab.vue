<script lang='ts' setup>
import { use, init as chartInit, time as chartTime, EChartsType } from "echarts";
import { CanvasRenderer } from "echarts/renderers";
import { HeatmapChart } from "echarts/charts";
import {
    TooltipComponent,
    LegendComponent,
    TitleComponent
} from "echarts/components";
import { onMounted, ref, shallowRef } from "vue";
import colors from 'tailwindcss/colors'

function getVirtualData(year: string) {
    const date = +chartTime.parse(year + '-01-01');
    const end = +chartTime.parse(+year + 1 + '-01-01');
    const dayTime = 3600 * 24 * 1000;
    const data = [];
    for (let time = date; time < end; time += dayTime) {
        data.push([
            chartTime.format(time, '{yyyy}-{MM}-{dd}', false),
            Math.floor(Math.random() * 100)
        ]);
    }
    return data;
}

use(() => [
    CanvasRenderer,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    HeatmapChart
]);

const option = ref<Parameters<EChartsType["setOption"]>[0]>({
    tooltip: {},
    visualMap: {
        type: "piecewise",
        min: 0,
        max: 100,
        orient: 'horizontal',
        left: 'right',
        bottom: 0,
        inRange: {
            color: [colors.slate[100], colors.blue[300], colors.blue[600]],
        },
        controller: {
            symbolSize: [10, 100]
        },
        pieces: [
            { lt: 1, },
            {
                gte: 1, lt: 20
            },
            {
                gte: 20, lt: 60
            },
            {
                gte: 60, lt: 80
            },
            {
                gte: 80
            }
        ],
        text: ['More', 'Less'],
        itemGap: 5,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
            fontSize: 10,
            color: colors.slate[300]
        }
    },
    calendar: {
        top: 30,
        left: 30,
        right: 10,
        cellSize: ['auto', 12],
        range: '2016',
        splitLine: {
            show: false
        },
        itemStyle: {
            borderWidth: 2,
            borderColor: "transparent",
        },
        dayLabel: {
            show: true,
            nameMap: "EN",
            color: colors.slate[400],
            fontSize: 10,

        },
        monthLabel: {
            show: true,
            nameMap: 'EN',
            color: colors.slate[400],
            align: "left",
            fontSize: 10
        },
        yearLabel: { show: false }
    },
    series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: getVirtualData('2016'),
        emphasis: {
            itemStyle: {
                borderColor: colors.sky[200],
                borderWidth: 3
            }
        },
        itemStyle: {
            borderRadius: 2,
        },
        select: {
            itemStyle: {
                shadowBlur: 2,
                borderWidth: 0,
            }
        },
        selectedMode: "single"
    }
});

const chartContainer = ref<HTMLElement>();
const chart = shallowRef<EChartsType>();
const selectedIndex = ref<number>(-1);

onMounted(() => {
    if (chartContainer.value) {
        chart.value = chartInit(chartContainer.value);
        chart.value.setOption(option.value);

        chart.value.on('selectchanged', 'series', function (change: any) {
            if (change.fromAction === "select") {
                selectedIndex.value = change.fromActionPayload.dataIndexInside;
            } else if (change.fromAction === "unselect") {
                selectedIndex.value = -1;
            }
        })
    }
})

</script>

<template>
    <div class="shadow-card rounded-lg">
        <div class="p-3">
            <div ref="chartContainer" class="h-36"></div>
        </div>
        <div class="bg-gray-100 border border-t-0 rounded-b-lg p-5 shadow-inner ">
            <p></p>
            <div class="grid grid-cols-3 gap-x-4 gap-y-2 px-8 text-sm">
                <div>
                    🚀 发布 <strong>1</strong> 篇文章
                </div>
                <div>
                    👀 阅读 <strong>1</strong> 篇文章
                </div>
                <div>
                    👍🏽 送出 <strong>2</strong> 个赞
                </div>
                <div>
                    📣 发布 <strong>3</strong> 条沸点
                </div>
                <div>
                    😀 关注 <strong>3</strong> 个掘友
                </div>
            </div>
        </div>
    </div>
</template>
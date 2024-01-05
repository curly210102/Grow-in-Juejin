<script lang='ts' setup>
import { computed, inject, ref } from 'vue';
import { IArticleListInjectContentType, articleListInjectionKey } from '../utils/injectionKeys';
import { EChartsOption, color } from 'echarts';
import { RadarSeriesOption } from 'echarts/charts';
import VChart from "vue-echarts";
import colors from 'tailwindcss/colors';
import useIsDarkMode from '../composables/useIsDarkMode';

const articleList = inject<IArticleListInjectContentType>
    (articleListInjectionKey, ref([]))
type Option = EChartsOption & {
    series: RadarSeriesOption
};

function transformTagValue(count: number) {
    if (count === 0) {
        return 0;
    }
    if (count === 1) {
        return 12.5
    }
    if (count <= 10) {
        return Math.min(25, 1.38 * (count - 1) + 12.5)
    }
    if (count <= 30) {
        return Math.min(50, 1.25 * (count - 10) + 25);
    }
    if (count <= 90) {
        return Math.min(87.5, 0.625 * (count - 30) + 50);
    }
    if (count <= 100) {
        return Math.min(100, 1.25 * (count - 90) + 87.5);
    }

    return 100;
}


const tags = computed(() => {
    const articles = articleList.value;
    const tagCount: Record<string, number> = {};

    articles.forEach(a => {
        a.tags.forEach(tag => {
            if (!tagCount[tag.tag_name]) {
                tagCount[tag.tag_name] = 0;
            }
            tagCount[tag.tag_name]++;
        })
    })

    const labels: Array<{ name: string, max: number }> = [];
    const values: Array<number> = [];
    Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 6).forEach(([name, value]) => {
        labels.push({
            name,
            max: 100
        });
        values.push(value)
    })

    while (labels.length < 6) {
        labels.push({
            name: '',
            max: 100
        });
        values.push(0)
    }

    return {
        labels,
        values
    }
})

const isDarkMode = useIsDarkMode();
const option = computed<Option>(() => {
    const indicator = tags.value.labels;
    const tagValues = tags.value.values;
    const values = tags.value.values.map(transformTagValue);
    const labelRenderSet = new Set();
    return ({
        tooltip: {
            position: ['50%', '50%'],
            textStyle: {
                fontSize: 10,
                color: isDarkMode.value ? colors.white : colors.slate[600]
            },
            backgroundColor: isDarkMode.value ? colors.zinc[900] : colors.white,
            borderColor: isDarkMode.value ? colors.gray[700] : colors.gray[200],
            formatter() {
                return indicator.filter(({ name }) => !!name).map(({ name }, i) => `${name}: ${Math.min(100, tagValues[i])}`).join("<br/>");
            }
        },
        radar: {
            radius: "60%",
            axisNameGap: 4,
            axisName: {
                color: colors.slate[400],
                fontSize: 10,
                formatter(name, currentIndicator) {
                    if (name && currentIndicator?.name && ![indicator[0].name, indicator[3].name].includes(currentIndicator.name)) {
                        const regex = /[\u4e00-\u9fa5]{1,4}|.{1,10}/g;
                        return name.match(regex)?.join("\n") ?? "";
                    } else {
                        return name ?? "";
                    }
                }
            },
            splitArea: isDarkMode.value ? {
                areaStyle: {
                    color: [colors.zinc[700], colors.zinc[800]],
                    shadowColor: 'rgba(0, 0, 0, 0.2)',
                    shadowBlur: 10
                }
            } : {},
            axisLine: isDarkMode.value ? {
                lineStyle: {
                    color: colors.black
                }
            } : {},
            splitLine: isDarkMode.value ? {
                lineStyle: {
                    color: colors.black
                }
            } : {},
            indicator,
            splitNumber: 8,
            axisLabel: {
                show: true,
                fontSize: 8,
                color: colors.slate[400],
                align: "center",
                formatter(value, index, a) {
                    if (labelRenderSet.has(index)) {
                        return '';
                    }
                    labelRenderSet.add(index);
                    if (index === 1) {
                        return '1';
                    }
                    if (index === 2) {
                        return '10';
                    }
                    if (index == 3) {
                        return '20';
                    }
                    if (index == 4) {
                        return '30';
                    }
                    if (index == 5) {
                        return '50';
                    }
                    if (index == 6) {
                        return '70';
                    }
                    if (index == 7) {
                        return '90';
                    }

                    return "";
                }
            },
        },
        series: [
            {
                type: 'radar',
                animation: false,
                areaStyle: {
                    opacity: 0.2,
                    color: colors.blue[300]
                },
                lineStyle: {
                    color: isDarkMode.value ? colors.blue[500] : colors.blue[300]
                },
                itemStyle: {
                    color: isDarkMode.value ? colors.blue[700] : colors.blue[500]
                },
                data: [
                    {
                        value: values,
                        symbolSize: 4,
                        label: {
                            show: true,
                            formatter(param) {
                                return Math.min(100, tagValues[param.dimensionIndex ?? 0]).toString();
                            },
                            position: "insideTop",
                            fontSize: 8,
                        }
                    }
                ]
            }
        ]
    })
})
</script>
<template>
    <div class="juejin-card gij-mb-2">
        <v-chart :option="option" autoresize class="gij-h-[240px] gij-block gij-min-w-0" />
    </div>
</template>
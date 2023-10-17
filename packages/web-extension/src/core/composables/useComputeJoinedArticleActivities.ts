import { computed, Ref } from "vue"
import { ActivityStatus } from "../components/ActivityCard.vue";
import { IArticleActivity, ArticleContentMap, IArticle, TypeArticleStatusSummaryGroup } from "../types";
import { format } from "../utils/date";

export default function useComputeJoinedArticleActivities(articleActivities: Ref<IArticleActivity[]>, articleList: Ref<IArticle[]>, articleContentMap: Ref<ArticleContentMap>, options: {
    includeOngoingActivity: boolean
} = {
        includeOngoingActivity: true
    }) {
    const activityStats = computed(() => {
        const stats = Object.fromEntries(articleActivities.value.map(a => [a.key, {
            view: 0,
            digg: 0,
            collect: 0,
            comment: 0,
            dates: new Set<string>(),
            articleCount: 0,
            recommendCount: 0,
            articleSummary: {
                recommend: [],
                valid: [],
                invalid: []
            } as TypeArticleStatusSummaryGroup,
            countByCategory: {} as Record<string, { total: number, recommend: number }>,
            point: 0
        }]))

        const sortedActivities = [...articleActivities.value].sort((a1, a2) => a1.endTimeStamp && a2.endTimeStamp ? a1.endTimeStamp - a2.endTimeStamp : (a1.endTimeStamp ? 1 : a2.endTimeStamp ? -1 : 0));

        articleList.value.forEach(({ view_count, tags, collect_count, comment_count, category, digg_count, publishTime, title, id, status }) => {
            const articleContentInfo = articleContentMap.value.get(id);
            if (articleContentInfo) {
                const { count, fragment: articleFragment, themeNames } = articleContentInfo;
                // hack: 删掉markdown语法
                const fragment = articleFragment.replaceAll("**", "");
                for (const activity of sortedActivities) {
                    const { signLink, signSlogan, wordCount, startTimeStamp = 0, endTimeStamp = Infinity, categories, tagNames, theme, recommend, pointRules } = activity;

                    const signSloganRegexp = new RegExp(signSlogan?.replace(/([()\[{*+.$^\\|?\]])|(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9]{1,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/g, (match) => {
                        if (match.startsWith("http")) {
                            const escaped = match.replace(/([()\[{*+.$^\\|?\]])/g, "\\$1");
                            return `${escaped}(\\s"${escaped}")?`
                        }
                        return "\\" + match
                    })?.replace(/N/g, "\\d+") ?? "");
                    const signLinkRegexp = new RegExp(`${signLink}((?:\/|$)?)`);

                    if (publishTime >= startTimeStamp && publishTime <= endTimeStamp) {
                        // 活动时间范围内
                        const sloganFit = signSloganRegexp.test(fragment);
                        const linkFit = signLinkRegexp.test(fragment);
                        const wordCountFit = count >= wordCount;
                        const categoryFit = categories.length < 1 || (categories.includes("*") ? !!category : categories.includes(category));
                        const tagFit = tagNames.length <= 0 || new Set(tags.filter(tag => tagNames.includes(tag.tag_name)).map(tag => tag.tag_id)).size === tagNames.length;
                        const themeFit = !theme || themeNames.includes(theme);
                        const activityStat = stats[activity.key];
                        const isRecommended = status === 2;
                        const recommendFit = !recommend || isRecommended;
                        if (sloganFit && linkFit && wordCountFit && categoryFit && tagFit && themeFit && recommendFit) {
                            const summaries = {
                                id,
                                title
                            }
                            activityStat.view += view_count;
                            activityStat.digg += digg_count;
                            activityStat.collect += collect_count;
                            activityStat.comment += comment_count;
                            activityStat.articleCount += 1;
                            activityStat.dates.add(format(publishTime, "YYYY-MM-DD"))
                            if (!activityStat.countByCategory[category]) {
                                activityStat.countByCategory[category] = {
                                    total: 0,
                                    recommend: 0
                                }
                            }
                            activityStat.countByCategory[category]["total"]++;
                            if (isRecommended) {
                                activityStat.countByCategory[category]["recommend"]++;
                                activityStat.recommendCount += 1;
                                activityStat.articleSummary["recommend"].push(summaries)

                            } else {
                                activityStat.articleSummary["valid"].push(summaries)
                            }

                            if (pointRules) {
                                pointRules.forEach(({ condition, point, amount }) => {
                                    if (condition === "valid") {
                                        activityStat.point += point;
                                    }
                                    if (condition === "recommend" && isRecommended) {
                                        activityStat.point += point;
                                    }
                                    if (condition === "view" && isRecommended && view_count > (amount ?? 0)) {
                                        activityStat.point += point;
                                    }
                                })
                            }
                            break;
                        } else if ((signSlogan && sloganFit) || (signLink && sloganFit) || themeFit) {
                            const summaries: TypeArticleStatusSummaryGroup["invalid"][0] = {
                                id,
                                title,
                                invalid_status: []
                            }
                            if (!categoryFit) {
                                summaries.invalid_status.push("category_range");
                            }

                            if (!wordCountFit) {
                                summaries.invalid_status.push("word_count");
                            }

                            if (!sloganFit) {
                                summaries.invalid_status.push("slogan_fit");
                            }

                            if (!linkFit) {
                                summaries.invalid_status.push("link_fit");
                            }

                            if (!tagFit) {
                                summaries.invalid_status.push("tag_fit");
                            }

                            if (!themeFit) {
                                summaries.invalid_status.push("theme_fit");
                            }

                            if (!recommendFit) {
                                summaries.invalid_status.push("recommend_fit");
                            }

                            activityStat.articleSummary["invalid"].push(summaries)
                        }

                    }
                }
            }
        })

        return stats
    })

    const joinedActivities = computed(() => {
        return articleActivities.value.filter(({ key, endTimeStamp }) => (activityStats.value[key]?.articleSummary.invalid.length > 0) || (activityStats.value[key]?.articleCount > 0) || (options.includeOngoingActivity && endTimeStamp && endTimeStamp >= Date.now())).map(({
            key,
            title,
            docLink,
            startTimeStamp,
            endTimeStamp,
            desc,
            rewards,
            addition
        }) => {
            const stat = activityStats.value[key];
            const activityStatus: ActivityStatus = {
                key,
                title,
                docLink,
                startTimeStamp,
                endTimeStamp,
                desc,
                view: stat?.view ?? 0,
                digg: stat?.digg ?? 0,
                collect: stat?.collect ?? 0,
                comment: stat?.comment ?? 0,
                dayCount: stat?.dates?.size ?? 0,
                articleCount: stat?.articleCount ?? 0,
                recommendCount: stat?.recommendCount ?? 0,
                rewards: [],
                point: stat?.point,
                articleSummary: stat?.articleSummary ?? [],
                addition
            };

            rewards.forEach(({ type, rewards, categories }) => {
                const count = categories ? categories.reduce((total, category) => total + (stat?.countByCategory[category]["total"] ?? 0), 0) : activityStatus[type === "days" ? "dayCount" : "articleCount"]
                const recommendCount = categories ? categories.reduce((total, category) => total + (stat?.countByCategory[category]["recommend"] ?? 0), 0) : activityStatus["recommendCount"];
                const currentRewardIndex = rewards.findLastIndex((reward) => reward.count <= count && (reward.recommend_count ?? 0) <= recommendCount);
                const currentReward = rewards[currentRewardIndex];
                const nextReward = rewards[currentRewardIndex + 1];

                if (currentReward || nextReward) {
                    activityStatus.rewards.push({
                        type,
                        currentLevel: currentReward?.name,
                        currentTarget: currentReward?.count,
                        nextTarget: nextReward?.count,
                        nextLevel: nextReward?.name,
                        nextRecommend: nextReward?.recommend_count,
                        categories,
                        count,
                        recommendCount
                    })
                }
            })
            return activityStatus;
        })
    })

    return joinedActivities;

}
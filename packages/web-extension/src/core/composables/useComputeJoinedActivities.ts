import { computed, Ref } from "vue"
import { ActivityStatus } from "../components/ActivityCard.vue";
import { IActivity, ArticleContentMap, IArticle, TypeInvalidSummary } from "../types";
import { format } from "../utils/date";

export default function useComputeJoinedActivities(activities: Ref<IActivity[]>, articleList: Ref<IArticle[]>, articleContentMap: Ref<ArticleContentMap>) {

    const activityStats = computed(() => {
        const stats = Object.fromEntries(activities.value.map(a => [a.key, {
            view: 0,
            digg: 0,
            collect: 0,
            comment: 0,
            dates: new Set<string>(),
            articleCount: 0,
            invalidSummaries: [] as TypeInvalidSummary[],
            countByCategory: {} as Record<string, number>
        }]))

        const sortedActivities = [...activities.value].sort((a1, a2) => a1.endTimeStamp && a2.endTimeStamp ? a1.endTimeStamp - a2.endTimeStamp : (a1.endTimeStamp ? 1 : a2.endTimeStamp ? -1 : 0));

        articleList.value.forEach(({ view_count, tags, collect_count, comment_count, category, digg_count, publishTime, title, id }) => {
            const articleContentInfo = articleContentMap.value.get(id);
            if (articleContentInfo) {
                const { count, fragment: articleFragment, themeNames } = articleContentInfo;
                // hack: 删掉markdown语法
                const fragment = articleFragment.replaceAll("**", "");
                for (const activity of sortedActivities) {
                    const { signLink, signSlogan, wordCount, startTimeStamp = 0, endTimeStamp = Infinity, categories, tagNames, theme } = activity;

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
                        if (sloganFit && linkFit && wordCountFit && categoryFit && tagFit && themeFit) {
                            activityStat.view += view_count;
                            activityStat.digg += digg_count;
                            activityStat.collect += collect_count;
                            activityStat.comment += comment_count;
                            activityStat.articleCount += 1;
                            activityStat.dates.add(format(publishTime, "YYYY-MM-DD"))
                            if (activityStat.countByCategory[category]) {
                                activityStat.countByCategory[category] = 0
                            }
                            activityStat.countByCategory[category]++;
                            break;
                        } else if ((sloganFit || tagFit) || (signLink ? sloganFit : false)) {
                            const summaries: TypeInvalidSummary = {
                                id,
                                title,
                                status: []
                            }
                            if (!categoryFit) {
                                summaries.status.push("category_range");
                            }

                            if (!wordCountFit) {
                                summaries.status.push("word_count");
                            }

                            if (!sloganFit) {
                                summaries.status.push("slogan_fit");
                            }

                            if (!linkFit) {
                                summaries.status.push("link_fit");
                            }

                            if (!tagFit) {
                                summaries.status.push("tag_fit");
                            }

                            if (!themeFit) {
                                summaries.status.push("theme_fit");
                            }

                            activityStat.invalidSummaries.push(summaries)

                        }

                    }
                }
            }
        })

        return stats
    })

    const joinedActivities = computed(() => {
        return activities.value.filter(({ key, endTimeStamp }) => (activityStats.value[key]?.articleCount > 0) || (endTimeStamp && endTimeStamp >= Date.now())).map(({
            key,
            title,
            docLink,
            startTimeStamp,
            endTimeStamp,
            desc,
            rewards
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
                rewards: [],
                invalid: stat?.invalidSummaries ?? []
            };

            rewards.forEach(({ type, rewards, categories }) => {
                const count = categories ? categories.reduce((total, category) => total + (stat?.countByCategory[category] ?? 0), 0) : activityStatus[type === "days" ? "dayCount" : "articleCount"]
                const nextRewardIndex = rewards.findIndex(reward => reward.count > count);

                const currentReward = nextRewardIndex < 0 ? rewards.slice(-1)[0] : rewards[nextRewardIndex - 1];
                const nextReward = rewards[nextRewardIndex];

                if (currentReward || nextReward) {
                    activityStatus.rewards.push({
                        type,
                        currentLevel: currentReward?.name,
                        currentTarget: currentReward?.count,
                        nextTarget: nextReward?.count,
                        nextLevel: nextReward?.name,
                        categories,
                        count
                    })
                }
            })
            return activityStatus;
        })
    })

    return joinedActivities;

}
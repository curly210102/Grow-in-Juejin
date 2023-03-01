// 本地存储全量，Max(最早的活动时间, 补全 count)
// 请求最近 10 篇文章

import { IArticle, IArticleContentItem, StorageKey } from "../types";
import { fetchArticleDetail, fetchUserArticles } from "../utils/api";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";
import nm from "nomatter";
import { countWords } from "@homegrown/word-counter";

type ResponseArticle = Awaited<ReturnType<typeof fetchUserArticles>>["data"];

export default async function initUserArticles(userId: string, earliestTime: number) {
    let articles: IArticle[] = [];
    let articleContentMap: Map<string, IArticleContentItem> =
        new Map();

    // 1. 请求最近的10篇动态
    // 2. 根据数量差和时间访问拉取文章
    // 数量差N：可能更新了N篇文章
    // 为了保证限时活动的准确性：拉取最早活动时间之后的文章
    // 3. 根据最后一篇文章的创建时间，找到本地数据中之后的文章，两部分拼接
    async function init() {
        await loadLocalStorage(StorageKey.ARTICLES).then(data => {
            if (data) {
                articles = data.list;
                articleContentMap = new Map<string, IArticleContentItem>(Object.entries(data.contents));
            }
        })
        sync();
    }

    async function sync() {
        if (!userId) {
            articles = [];
            return;
        }
        // 请求最近的一批
        const { cursor, data: lastArticleList, count, has_more } = await fetchUserArticles(userId, "0");
        const oneRequestCount = +cursor;

        const tailOfLastActionList = lastArticleList[lastArticleList.length - 1];
        const newArticleList = [...lastArticleList];

        // 根据数量差计算需请求的次数
        const predictRequestTimes = (has_more && count > oneRequestCount && tailOfLastActionList) ? Math.ceil((count - articles.length) / oneRequestCount) : 0;
        const MAX_PARALLEL = 10;
        const batchRequestTimes = Math.ceil(predictRequestTimes / MAX_PARALLEL);
        const lastBatchRequestCount = predictRequestTimes % MAX_PARALLEL;
        let tailOfResponse = null;
        for (let time = 1; time <= batchRequestTimes; time++) {
            const prevCursor = oneRequestCount + (time - 1) * MAX_PARALLEL * oneRequestCount;
            const parallelRequestCount = time === batchRequestTimes ? lastBatchRequestCount : MAX_PARALLEL;
            const batchArticles = (await Promise.all(Array.from(new Array(parallelRequestCount), (_v, i) => i).map((i) => fetchUserArticles(userId, `${prevCursor + i * oneRequestCount}`)))).filter(res => res.data)

            batchArticles.forEach(item => {
                if (item.data) {
                    newArticleList.push(...item.data);
                }
            })

            tailOfResponse = batchArticles.slice(-1)[0];
        }



        // 存在用户删除动态的情况，这时上一步的差值不一定够
        const lastArticle = newArticleList.slice(-1)[0];
        if (tailOfResponse && tailOfResponse.has_more && lastArticle && +lastArticle.article_info.ctime * 1000 > earliestTime) {
            await syncToEnd(userId, tailOfResponse.cursor, newArticleList);
        }

        const articleDetails = await Promise.all(
            newArticleList
                .filter(({ article_id, article_info }) => {
                    const id = article_id;
                    const modifiedTime = +article_info.mtime * 1000
                    return (
                        !articleContentMap.has(id) ||
                        articleContentMap.get(id)?.["modifiedTimeStamp"] !== modifiedTime
                    );
                })
                .map(({ article_id }) => fetchArticleDetail(article_id))
        );

        articleDetails.forEach(({ article_info }) => {
            const { article_id, mark_content, mtime } = article_info;
            const content = nm(mark_content).trim();
            articleContentMap.set(article_id, {
                fragment: content.slice(0, 200) + "\n" + content.slice(-200),
                count: countWords(mark_content),
                modifiedTimeStamp: +mtime * 1000,
            });
        });

        mergeArticles(newArticleList);

        saveLocalStorage(StorageKey.ARTICLES, {
            list: articles,
            contents: Object.fromEntries(articleContentMap)
        })
    }

    async function syncToEnd(userId: string, cursor: string, list: ResponseArticle = []) {
        const { data, cursor: nextCursor, has_more } = await fetchUserArticles(userId, cursor)

        list.push(...data);

        if (has_more && +(data.slice(-1)[0]?.article_info.ctime ?? "0") * 1000 > earliestTime) {
            await syncToEnd(userId, nextCursor);
        }

        return list;
    }

    async function mergeArticles(newArticleList: ResponseArticle) {
        const lastArticle = newArticleList.slice(-1)[0]

        if (lastArticle) {
            const createTime = +lastArticle.article_info.ctime * 1000;
            const oldArticles = articles.filter(a => a.publishTime < createTime);
            articles = [...newArticleList.map(article => {
                const { article_id, article_info, category, tags } = article;
                // 文章字数、内容、发布时间、评论、点赞、收藏、阅读数
                const {
                    ctime,
                    mtime,
                    audit_status,
                    verify_status,
                    view_count,
                    collect_count,
                    digg_count,
                    comment_count,
                    title
                } = article_info;
                const { category_name } = category;
                const publishTime = new Date(+ctime * 1000).valueOf();
                const modifiedTime = new Date(+mtime * 1000).valueOf();

                return {
                    category: category_name,
                    id: article_id,
                    publishTime,
                    modifiedTime,
                    view_count,
                    collect_count,
                    digg_count: digg_count,
                    comment_count,
                    title,
                    tags,
                    verify:
                        verify_status === 0
                            ? 0
                            : audit_status === 2 && verify_status === 1
                                ? 1
                                : 2
                }
            }), ...oldArticles];

        }
    }

    await init();

    return {
        articles, articleContentMap
    }
}
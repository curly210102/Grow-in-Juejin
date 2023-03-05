// 本地存储全量，Max(最早的活动时间, 补全 count)
// 请求最近 10 篇文章

import { IArticle, IArticleContentItem, StorageKey } from "../types";
import { fetchArticleDetail, fetchUserArticles } from "../utils/api";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";
import nm from "nomatter";
import { countWords } from "@homegrown/word-counter";
import { batchRequestData } from "../utils/batchRequest";

type ResponseArticle = Awaited<ReturnType<typeof fetchUserArticles>>["data"];

export default async function initUserArticles(userId: string, earliestTime: number) {
    if (!userId) {
        return;
    }

    const localArticles = await loadLocalStorage([StorageKey.ARTICLE_LIST, StorageKey.ARTICLE_CONTENTS]).then(data => {
        return {
            list: data?.[0] ?? [],
            contents: data?.[1] ?? {}
        }
    });

    return await sync(userId, earliestTime, localArticles);
}


// 1. 请求最近的10篇文章
// 2. 根据数量差和活动时间访问拉取文章
// 数量差N：可能更新了N篇文章
// 为了保证限时活动的准确性：拉取最早活动时间之后的文章
// 3. 根据最后一篇文章的创建时间，找到本地数据中之后的文章，两部分拼接
async function sync(userId: string, earliestTime: number, localRawData: {
    "list": [],
    "contents": {}
}) {
    const localArticleList = [...localRawData.list];
    const localArticleContentMap = new Map<string, IArticleContentItem>(Object.entries(localRawData.contents));
    const currentArticleList = await syncArticleList(userId, localArticleList, earliestTime);
    await syncArticleDetails(currentArticleList, localArticleContentMap);
}

async function syncArticleList(userId: string, localArticleList: IArticle[], earliestTime: number) {
    // 请求最近的一批
    const { cursor, data: lastArticleList, count, has_more } = await fetchUserArticles(userId, "0");
    const oneRequestCount = +cursor;

    const tailOfLastActionList = lastArticleList[lastArticleList.length - 1];
    const newArticleList = [...lastArticleList];
    // 根据数量差计算需请求的次数
    const predictRequestTimes = (has_more && count > oneRequestCount && tailOfLastActionList) ? Math.ceil((count - localArticleList.length) / oneRequestCount) : 0;
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
    // 存在用户删除文章的情况，这时上一步的差值不一定够，逐个请求到 earliestTime 为止
    const lastArticle = newArticleList.slice(-1)[0];
    if (tailOfResponse && tailOfResponse.has_more && lastArticle && +lastArticle.article_info.ctime * 1000 > earliestTime) {
        await syncToEnd(userId, tailOfResponse.cursor, newArticleList, earliestTime);
    }

    const mergedArticleList = mergeArticleList(localArticleList, newArticleList);
    await saveLocalStorage(StorageKey.ARTICLE_LIST, mergedArticleList);
    return mergedArticleList;
}


async function syncToEnd(userId: string, cursor: string, list: ResponseArticle = [], earliestTime: number) {
    const { data, cursor: nextCursor, has_more } = await fetchUserArticles(userId, cursor)

    list.push(...data);

    if (has_more && +(data.slice(-1)[0]?.article_info.ctime ?? "0") * 1000 > earliestTime) {
        await syncToEnd(userId, nextCursor, list, earliestTime);
    }

    return list;
}

function mergeArticleList(oldArticleList: IArticle[], newArticleList: ResponseArticle) {
    if (!newArticleList.length) {
        return [];
    }
    const lastArticle = newArticleList.slice(-1)[0]
    const createTime = +lastArticle.article_info.ctime * 1000;
    const oldArticles = oldArticleList.filter(a => a.publishTime < createTime);
    return [...newArticleList.map(article => {
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

async function syncArticleDetails(articleList: IArticle[], localArticleContentMap: Map<string, IArticleContentItem>) {
    const newArticleContentMap = new Map(localArticleContentMap);
    // 请求 article details
    const articleDetailRequestData = articleList
        .filter(({ id, modifiedTime }) => {
            return (
                !localArticleContentMap.has(id) ||
                localArticleContentMap.get(id)?.["modifiedTimeStamp"] !== modifiedTime
            );
        }).map(({ id }) => id);
    const articleDetails = await batchRequestData(articleDetailRequestData, fetchArticleDetail, 10)
    articleDetails.forEach(({ article_info }) => {
        const { article_id, mark_content, mtime } = article_info;
        const content = nm(mark_content).trim();
        newArticleContentMap.set(article_id, {
            fragment: content.slice(0, 300) + "\n" + content.slice(-200),
            count: countWords(mark_content),
            modifiedTimeStamp: +mtime * 1000,
        });
    });

    await saveLocalStorage(StorageKey.ARTICLE_CONTENTS, Object.fromEntries(newArticleContentMap));
}
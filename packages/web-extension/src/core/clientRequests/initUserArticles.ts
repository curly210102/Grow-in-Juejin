// 本地存储全量，Max(最早的活动时间, 补全 count)
// 请求最近 10 篇文章

import { ArticleContentMap, IArticle, IArticleContentItem, StorageKey } from "../types";
import { fetchArticleDetail, fetchUserArticles } from "../utils/api";
import { batchSaveLocalStorage, loadLocalStorage, saveLocalStorage } from "../utils/storage";
import nm from "nomatter";
import { countWords } from "@homegrown/word-counter";
import { batchRequestData } from "../utils/batchRequest";
import { MS_OF_7DAY } from "../utils/date";

type ResponseArticle = Awaited<ReturnType<typeof fetchUserArticles>>["data"];

export default async function initUserArticles(userId: string, earliestTime: number) {
    if (!userId) {
        return {
            articleList: [],
            articleContentMap: new Map() as ArticleContentMap
        }
    }

    const localArticles = await loadLocalStorage([StorageKey.ARTICLE_LIST, StorageKey.ARTICLE_CONTENTS]).then(data => {
        return {
            list: data[StorageKey.ARTICLE_LIST]?.[userId] ?? [],
            contents: data[StorageKey.ARTICLE_CONTENTS]?.[userId] ?? []
        }
    });

    const data = await sync(userId, earliestTime, localArticles);
    await cleanupCache();
    return data;
}

export async function initUserArticleList (userId: string) {
    const localArticles = await loadLocalStorage([StorageKey.ARTICLE_LIST]).then(data => {
        return data[StorageKey.ARTICLE_LIST]?.[userId] ?? []
    });

    return await syncArticleList(userId, localArticles)
}


// 1. 请求最近的10篇文章
// 2. 根据数量差和活动时间访问拉取文章
// 数量差N：可能更新了N篇文章
// 为了保证限时活动的准确性：拉取最早活动时间之后的文章
// 3. 根据最后一篇文章的创建时间，找到本地数据中之后的文章，两部分拼接
async function sync(userId: string, earliestTime: number, localRawData: {
    "list": [],
    "contents": []
}) {
    const localArticleList = [...localRawData.list];
    const localArticleContentMap = new Map<string, IArticleContentItem>(localRawData.contents);
    const currentArticleList = await syncArticleList(userId, localArticleList, earliestTime);
    const currentArticleContentMap = await syncArticleDetails(userId, currentArticleList, localArticleContentMap, earliestTime);

    return {
        articleList: currentArticleList,
        articleContentMap: currentArticleContentMap
    }
}

async function syncArticleList(userId: string, localArticleList: IArticle[] = [], earliestTime: number = 0) {
    // 请求最近的一批
    const { cursor, data, count, has_more } = await fetchUserArticles(userId, "0");
    const lastArticleList = data || [];
    const oneRequestCount = +cursor;

    const lastArticleOfFirstFetch = lastArticleList[lastArticleList.length - 1];
    const newArticleList = [...lastArticleList];
    // 根据数量差计算需请求的次数
    const predictRequestTimes = (has_more && count > oneRequestCount && lastArticleOfFirstFetch) ? Math.ceil((count - localArticleList.length) / oneRequestCount) : 0;
    const MAX_PARALLEL = 5;
    const batchRequestTimes = Math.ceil(predictRequestTimes / MAX_PARALLEL);
    const lastBatchRequestCount = (predictRequestTimes % MAX_PARALLEL) || MAX_PARALLEL;
    let cursorOfLastResponse = null;
    for (let time = 1; time <= batchRequestTimes; time++) {
        const prevCursor = oneRequestCount + (time - 1) * MAX_PARALLEL * oneRequestCount;
        const parallelRequestCount = time === batchRequestTimes ? lastBatchRequestCount : MAX_PARALLEL;
        const batchArticles = (await Promise.all(Array.from(new Array(parallelRequestCount), (_v, i) => i).map((i) => fetchUserArticles(userId, `${prevCursor + i * oneRequestCount}`)))).filter(res => res.data) || [];
        batchArticles.forEach(item => {
            if (item.data) {
                newArticleList.push(...item.data);
            }
        })

        const tailOfResponse = batchArticles.slice(-1)[0];
        const lastArticle = newArticleList.slice(-1)[0];

        if (!tailOfResponse || !tailOfResponse?.has_more || +lastArticle?.article_info.ctime * 1000 <= earliestTime) {
            cursorOfLastResponse = null;
        } else {
            cursorOfLastResponse = tailOfResponse.cursor
        }
    }
    // 存在用户删除文章的情况，这时上一步的差值不一定够，逐个请求到 earliestTime 为止
    const lastArticle = newArticleList.slice(-1)[0];
    if (cursorOfLastResponse && lastArticle && +lastArticle.article_info.ctime * 1000 > earliestTime) {
        await syncToEnd(userId, cursorOfLastResponse, newArticleList, earliestTime);
    }

    const mergedArticleList = mergeArticleList(localArticleList, newArticleList);
    const localData = await loadLocalStorage(StorageKey.ARTICLE_LIST) ?? {};
    localData[userId] = mergedArticleList;
    await saveLocalStorage(StorageKey.ARTICLE_LIST, localData);
    await updateCacheExpireTime(userId);
    return mergedArticleList;
}


async function syncToEnd(userId: string, cursor: string, list: ResponseArticle = [], earliestTime: number) {
    const { data, cursor: nextCursor, has_more } = await fetchUserArticles(userId, cursor)

    if (!data) {
        return list;
    }

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

async function syncArticleDetails(userId: string, articleList: IArticle[], localArticleContentMap: Map<string, IArticleContentItem>, earliestTime: number) {
    const newArticleContentMap = new Map(localArticleContentMap);
    // 请求 article details
    const articleDetailRequestData = articleList
        .filter(({ id, modifiedTime, publishTime }) => {
            return (
                (!localArticleContentMap.has(id) && publishTime >= earliestTime) ||
                localArticleContentMap.get(id)?.["modifiedTimeStamp"] !== modifiedTime
            );
        }).map(({ id }) => id);
    const articleDetails = await batchRequestData(articleDetailRequestData, fetchArticleDetail, 10)
    articleDetails.forEach(({ article_info, theme_list }) => {
        const { article_id, mark_content, mtime } = article_info;
        const themeNames = new Set(theme_list.map(theme => theme.theme?.name).filter(name => !!name));
        const content = nm(mark_content).trim();
        newArticleContentMap.set(article_id, {
            fragment: content.slice(0, 300) + "\n" + content.slice(-200),
            count: countWords(mark_content),
            modifiedTimeStamp: +mtime * 1000,
            themeNames: [...themeNames]
        });
    });

    const localData = (await loadLocalStorage(StorageKey.ARTICLE_CONTENTS)) ?? {};
    localData[userId] = [...newArticleContentMap];
    await saveLocalStorage(StorageKey.ARTICLE_CONTENTS, localData);
    await updateCacheExpireTime(userId);

    return newArticleContentMap;
}

async function updateCacheExpireTime(userId: string) {
    const localCache = (await loadLocalStorage(StorageKey.ARTICLE_CACHE)) ?? {};
    localCache[userId] = Date.now() + MS_OF_7DAY;
    await saveLocalStorage(StorageKey.ARTICLE_CACHE, localCache);
}

async function cleanupCache() {
    const localData = await loadLocalStorage([StorageKey.ARTICLE_CACHE, StorageKey.ARTICLE_LIST, StorageKey.ARTICLE_CONTENTS]);
    const { [StorageKey.ARTICLE_CACHE]: localCache, ...rest } = localData; const currentTime = Date.now();

    if (localCache) {
        Object.keys(localCache).forEach(userId => {
            if (localCache[userId] <= currentTime) {
                delete rest?.[StorageKey.ARTICLE_LIST]?.[userId];
                delete rest?.[StorageKey.ARTICLE_CONTENTS]?.[userId];
            }
        });
    }

    await batchSaveLocalStorage(rest);
}
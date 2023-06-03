import { ActionType, IArticleActivity } from "../types";

export const fetchUserProfile = async (userId?: string | null) => {
    try {
        const res = await fetch(
            "https://api.juejin.cn/user_api/v1/user/get" +
            (userId ? `?user_id=${userId}` : ""), {
            method: 'GET',
            credentials: 'include',
            mode: 'cors'
        }
        ).then((res) => res.json());
        return res.data;
    } catch (error) {
        throw new Error("Request Failed");
    }
};

export const fetchUserDynamic = async (
    userId: string,
    cursor: string
): Promise<{
    cursor: string;
    list: Array<{
        time: number;
        id: number;
        action: ActionType;
    }>;
    hasMore: boolean;
    count: number;
}> => {
    try {
        const res = await fetch(
            `https://api.juejin.cn/user_api/v1/user/dynamic?user_id=${userId}&cursor=${cursor}`
        ).then((res) => res.json());
        return res.data;
    } catch (error) {
        throw new Error("Request Failed");
    }
};

export const fetchUserArticles = async (
    userId: string,
    cursor: string
): Promise<{
    cursor: string;
    data: Array<{
        article_id: string,
        article_info: {
            ctime: string,
            mtime: string,
            audit_status: number,
            verify_status: number,
            view_count: number,
            collect_count: number,
            digg_count: number,
            comment_count: number,
            title: string
        },
        category: {
            category_name: string
        },
        tags: { id: number, tag_id: string, tag_name: string }[]
    }>;
    has_more: boolean;
    count: number;
}> => {
    try {
        const res = await fetch(
            `https://api.juejin.cn/content_api/v1/article/query_list`,
            {
                method: "POST",
                body: JSON.stringify({
                    user_id: userId,
                    cursor,
                    sort_type: 2
                }),
                headers: {
                    "User-agent": window.navigator.userAgent,
                    "content-type": "application/json"
                },
            }
        ).then((res) => res.json());
        return res;
    } catch (error) {
        throw new Error("Request Failed");
    }
};


export const fetchActivities = async (): Promise<Array<IArticleActivity>> => {
    try {
        const res = await fetch(
            import.meta.env.DEV ?
                "https://gitee.com/curlly-brackets/grow-in-juejin/raw/dev/activity.json" :
                "https://gitee.com/curlly-brackets/grow-in-juejin/raw/master/activity.json"
        ).then((res) => res.json());
        return res;
    } catch (error) {
        throw new Error("Request Failed");
    }
};

export const fetchPinActivities = async (): Promise<Array<IArticleActivity>> => {
    try {
        const res = await fetch(
            import.meta.env.DEV ?
                "https://gitee.com/curlly-brackets/grow-in-juejin/raw/dev/pin_activity.json" :
                "https://gitee.com/curlly-brackets/grow-in-juejin/raw/master/pin_activity.json"
        ).then((res) => res.json());
        return res;
    } catch (error) {
        throw new Error("Request Failed");
    }
};

export const fetchOtherActivities = async (): Promise<Array<IArticleActivity>> => {
    try {
        const res = await fetch(
            import.meta.env.DEV ?
                "https://gitee.com/curlly-brackets/grow-in-juejin/raw/dev/other_activity.json" :
                "https://gitee.com/curlly-brackets/grow-in-juejin/raw/master/other_activity.json"
        ).then((res) => res.json());
        return res;
    } catch (error) {
        throw new Error("Request Failed");
    }
};

export const fetchTopics = async (): Promise<Array<Record<string, {
    id: string,
    description: string
}>>> => {
    try {
        const res = await fetch(
            import.meta.env.DEV ?
                "https://gitee.com/curlly-brackets/grow-in-juejin/raw/dev/topics_v2.json" :
                "https://gitee.com/curlly-brackets/grow-in-juejin/raw/master/topics_v2.json"
        ).then((res) => res.json());
        return res;
    } catch (error) {
        throw new Error("Request Failed");
    }
};

export async function fetchArticleDetail(articleId: string): Promise<{
    article_info: {
        article_id: string,
        mark_content: string,
        mtime: string
    },
    theme_list: [] | Array<{
        theme: {
            theme_id: string,
            name: string
        }
    }>
}> {
    try {
        const res = await fetch(
            "https://api.juejin.cn/content_api/v1/article/detail",
            {
                method: "POST",
                body: JSON.stringify({
                    article_id: articleId,
                    need_theme: true
                }),
                headers: {
                    "User-agent": window.navigator.userAgent,
                    "content-type": "application/json",
                }
            }
        ).then((res) => res.json());

        if (res.err_no === 0) {
            return res.data;
        } else {
            throw new Error("Request Failed");
        }
    } catch (e) {
        throw new Error("Request Failed");
    }
}


export const fetchUserPins = async (
    userId: string,
    cursor: string,
    limit: number = 100
): Promise<{
    cursor: string;
    data: Array<{
        msg_id: string,
        msg_Info: {
            ctime: string,
            mtime: string,
            content: string,
        },
        topic: {
            title: string
        },
        theme: {
            name: string
        },
        jcode_info: null | {}
    }>;
    has_more: boolean;
    count: number;
}> => {
    try {
        const res = await fetch(
            `https://api.juejin.cn/content_api/v1/short_msg/query_list`,
            {
                method: "POST",
                body: JSON.stringify({
                    user_id: userId,
                    cursor,
                    limit,
                    sort_type: 4
                }),
                headers: {
                    "User-agent": window.navigator.userAgent,
                    "content-type": "application/json"
                },
            }
        ).then((res) => res.json());
        return res;
    } catch (error) {
        throw new Error("Request Failed");
    }
};
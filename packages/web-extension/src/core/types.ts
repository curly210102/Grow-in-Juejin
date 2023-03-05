export interface IActivity {
    key: string;
    desc?: string;
    figure?: string;
    startTimeStamp?: number;
    title: string;
    docLink: string;
    category: string;
    endTimeStamp?: number;
    rewards: [
        {
            type: "days";
            rewards: Array<{
                name: string;
                count: number;
            }>;
        },
        {
            type: "count";
            rewards: Array<{
                name: string;
                count: number;
            }>;
        }
    ];
    categories: string[];
    signSlogan: string;
    signLink: string;
    tagNames: string[];
    wordCount: number;
}

export interface IUser {
    userId: string,
    userName: string,
    avatar: string,
    description: string,
    followerCount: number,
    postCount: number,
    likeCount: number
}

export enum ActionType {
    "POST",
    "LKPOST",
    "PIN",
    "LKPIN",
    "FOLLOW"
}

export type UserActions = {
    [key in ActionType]: number
}

export interface IDailyActions {
    [date: number]: UserActions
}

export enum StorageKey {
    "USER" = "user",
    "DYNAMIC" = "dynamic",
    "ARTICLE_LIST" = "articleList",
    "ARTICLE_CONTENTS" = "articleContents",
    "PINS" = "pins"
}

export interface IArticle {
    category: string;
    id: string;
    publishTime: number;
    modifiedTime: number;
    view_count: number;
    collect_count: number;
    digg_count: number;
    comment_count: number;
    title: string;
    tags: {
        tag_id: string;
        tag_name: string;
    }[],
    verify: number
}

export interface IArticleContentItem {
    count: number;
    modifiedTimeStamp: number;
    fragment: string;
}

export type TypeInvalidSummary = {
    id: string;
    title: string;
    status: Array<"time_range"
        | "category_range"
        | "word_count"
        | "slogan_fit"
        | "link_fit"
        | "tag_fit">
};

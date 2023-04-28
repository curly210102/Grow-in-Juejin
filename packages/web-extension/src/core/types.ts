export interface IActivity {
    key: string;
    desc?: string;
    figure?: string;
    startTimeStamp?: number;
    title: string;
    docLink: string;
    category: string;
    theme: string;
    endTimeStamp?: number;
    rewards: [
        {
            type: "days";
            rewards: Array<{
                name: string;
                count: number;
            }>;
            categories?: string[]
        },
        {
            type: "count";
            rewards: Array<{
                name: string;
                count: number;
            }>;
            categories?: string[];
        }
    ];
    categories: string[];
    signSlogan: string;
    signLink: string;
    tagNames: string[];
    wordCount: number;
    lastModifiedTime: number;
}

export interface IUser {
    userId: string,
    userName: string,
    avatar: string,
    description: string,
    followerCount: number,
    postCount: number,
    likeCount: number,
    lastVisitedActivityTime: number
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
    "DYNAMIC" = "allDynamics",
    "ARTICLE_LIST" = "articleList",
    "ARTICLE_CONTENTS" = "articleContents",
    "PINS" = "pins",
    "ACTIVITIES" = "activities",
    "ARTICLE_CACHE" = "articleCache",
    "TOPICS" = "pinTopics",
    "PREFERENCE" = "preference",
    "PERSISTENCE_STATE" = "persistenceState"
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
    themeNames: string[]
}

export type ArticleContentMap = Map<string, IArticleContentItem>

export type TypeInvalidSummary = {
    id: string;
    title: string;
    status: Array<"time_range"
        | "category_range"
        | "word_count"
        | "slogan_fit"
        | "link_fit"
        | "tag_fit" 
        | "theme_fit">
};


export enum PreferenceKey {
    CONTRIBUTION_OF_MINE,
    CONTRIBUTION_OF_OTHERS,
    TRENDING_OF_MINE,
    TRENDING_OF_OTHERS,
    ACTIVITIES_OF_MINE,
    BADGE_OF_NEW_ACTIVITY,
}

export enum PreferenceValue {
    SHOW,
    HIDE,
    COLLAPSE
}

export type Preferences = Partial<Record<PreferenceKey, PreferenceValue | boolean>>;


export type PersistenceState = {
    "lastVisitedActivityTime": number
};
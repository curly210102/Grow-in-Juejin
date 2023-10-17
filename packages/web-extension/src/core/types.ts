export interface IActivity {
    key: string;
    desc?: string;
    figure?: string;
    startTimeStamp: number;
    title: string;
    docLink: string;
    category: string;
    endTimeStamp: number;
    lastModifiedTime: number;
    addition?: {
        link: string;
        text: string;
    }
}
export interface IArticleActivity extends IActivity {
    theme: string;
    rewards: [
        {
            type: "days";
            rewards: Array<{
                name: string;
                count: number;
                recommend_count: number;
            }>;
            categories?: string[]
        },
        {
            type: "count";
            rewards: Array<{
                name: string;
                count: number;
                recommend_count: number
            }>;
            categories?: string[];
        }
    ];
    pointRules?: {
        condition: "valid" | "recommend" | "view",
        point: number,
        amount?: number
    }[],
    categories: string[];
    signSlogan: string;
    signLink: string;
    tagNames: string[];
    wordCount: number;
    recommend: boolean;
}

export interface IPinActivity extends IActivity {
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
    rules?: Array<IPinActivityRule>
}

export interface IPinActivityRule {
    "topic": {
        "link": string,
        "text": string
    } | null;
    "theme": Array<string>;
    "jcode": boolean;
    "keywords": Array<string>;
    "subStartTime": number;
    "subEndTime": number;
    "subLink": string
}

export interface IUser {
    userId: string;
    userName: string;
    avatar: string;
    description: string;
    followerCount: number;
    postCount: number;
    likeCount: number;
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
    "ARTICLE_ACTIVITIES" = "activities",
    "PIN_ACTIVITIES" = "pinActivities",
    "OTHER_ACTIVITIES" = "otherActivities",
    "ARTICLE_CACHE" = "articleCache",
    "TOPICS" = "pinTopics",
    "PIN_LIST" = "pinList",
    "PREFERENCE" = "preference",
    "PERSISTENCE_STATE" = "persistenceState",
    "THEME" = "theme"
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
    verify: number,
    status: number
}

export interface IArticleContentItem {
    count: number;
    modifiedTimeStamp: number;
    fragment: string;
    themeNames: string[]
}

export type ArticleContentMap = Map<string, IArticleContentItem>

export type TypeArticleStatusSummaryGroup = {
    "recommend": TypeArticleStatusSummary[],
    "valid": TypeArticleStatusSummary[],
    "invalid": Array<TypeArticleStatusSummary & {
        invalid_status: Array<"time_range"
            | "category_range"
            | "word_count"
            | "slogan_fit"
            | "link_fit"
            | "tag_fit"
            | "theme_fit"
            | "recommend_fit">
    }>
}

export type TypeArticleStatusSummary = {
    id: string;
    title: string;
    view_count: number
};


export interface IPin {
    id: string,
    theme: string,
    topic: string,
    jcode: boolean,
    content: string,
    publishTime: number
}


export enum PreferenceKey {
    CONTRIBUTION_OF_MINE,
    CONTRIBUTION_OF_OTHERS,
    TRENDING_OF_MINE,
    TRENDING_OF_OTHERS,
    ACTIVITIES_OF_MINE,
    BADGE_OF_NEW_ACTIVITY,
    TAG_RADAR_OF_MINE,
    TAG_RADAR_OF_OTHERS,
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

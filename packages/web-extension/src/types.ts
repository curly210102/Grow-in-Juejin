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
    "DYNAMIC" = "dynamic"
}
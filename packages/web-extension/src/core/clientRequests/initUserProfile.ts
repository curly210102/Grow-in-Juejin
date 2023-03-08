import { IUser, StorageKey } from "../types";
import { fetchUserProfile } from "../utils/api";
import { loadLocalStorage, saveLocalStorage } from "../utils/storage";


export default async function initUserProfile(userId?: string) {
    const [localUserProfile = {}, remoteUserData] = await Promise.all([
        loadLocalStorage(StorageKey.USER),
        fetchUserProfile(userId)
    ]);

    if (!remoteUserData) {
        throw new Error("User Login")
    }

    const { user_id, user_name, avatar_large, description, follower_count, post_article_count, got_digg_count } = remoteUserData;

    const currentUserProfile: IUser = {
        userId: user_id,
        userName: user_name,
        avatar: avatar_large,
        description,
        followerCount: follower_count,
        postCount: post_article_count,
        likeCount: got_digg_count
    }

    if (currentUserProfile.userId !== localUserProfile.userId) {
        await chrome.storage.local.clear();
    }

    await saveLocalStorage(StorageKey.USER, currentUserProfile);

    return currentUserProfile;
}
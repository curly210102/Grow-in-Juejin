import { PreferenceKey, PreferenceValue } from "./core/types"

export const entryPath = "src/app/index.html"
export const frameURL = "https://juejin.cn/s/a1562763041dc"
export const extCode = "586f72fd06ab3"

export const initialPreferences = {
    [PreferenceKey.CONTRIBUTION_OF_MINE]: PreferenceValue.SHOW,
    [PreferenceKey.CONTRIBUTION_OF_OTHERS]: PreferenceValue.SHOW,
    [PreferenceKey.TRENDING_OF_MINE]: PreferenceValue.SHOW,
    [PreferenceKey.TRENDING_OF_OTHERS]: PreferenceValue.SHOW,
    [PreferenceKey.ACTIVITIES_OF_MINE]: PreferenceValue.SHOW,
    [PreferenceKey.TAG_RADAR_OF_MINE]: PreferenceValue.SHOW,
    [PreferenceKey.TAG_RADAR_OF_OTHERS]: PreferenceValue.SHOW,
    [PreferenceKey.BADGE_OF_NEW_ACTIVITY]: true
}
export const fetchUserProfile = async () => {
    try {
        const res = await fetch("https://api.juejin.cn/user_api/v1/user/get").then(res => res.json())
        return res.data;
    } catch (error) {
        throw new Error("Request Failed")
    }
}
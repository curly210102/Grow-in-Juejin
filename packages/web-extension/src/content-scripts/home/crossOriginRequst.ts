import initUserArticles from "../../core/clientRequests/initUserArticles"


export default async function () {
    const res = await initUserArticles("2340192209345405", Infinity);
    console.log(res)
}

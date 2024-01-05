export async function batchRequestList<T>(requestList: Array<() => Promise<T>>, countOfOneBatch: number) {
    const requestCount = requestList.length;
    const resultList: Array<T> = [];

    for (let start = 0; start < requestCount; start += countOfOneBatch) {
        const results = await Promise.all(requestList.slice(start, start + countOfOneBatch).map(factory => factory()));
        resultList.push(...results);
    }

    return resultList;
}

export async function batchRequestData<T, P>(requestData: Array<T>,
    promiseFactory: (arg: T) => Promise<P>, countOfOneBatch: number) {
    const requestCount = requestData.length;
    const resultList: Array<P> = [];

    for (let start = 0; start < requestCount; start += countOfOneBatch) {
        const results = await Promise.all(requestData.slice(start, start + countOfOneBatch).map(data => promiseFactory(data)));
        resultList.push(...results);
    }

    return resultList;
}
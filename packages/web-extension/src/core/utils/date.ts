export const MS_OF_YEAR = 366 * 24 * 3600 * 1000;
export const MS_OF_DAY = 24 * 3600 * 1000;
export const addOneYear = (date: Date) => {
    const year = date.getFullYear();
    return date.setFullYear(year + 1);
}
export const getLastYearRange = () => {
    const current = new Date();
    return [current.valueOf() - MS_OF_YEAR, current.valueOf()]
}
export const getFullYearRange = (year: number) => {
    return [new Date(`${year}/01/01`).valueOf(), new Date(`${year}/12/31`).valueOf()];
}
export const startOfDate = (ms: number) => {
    return new Date(ms).setHours(0, 0, 0, 0)
}
export const startOfYear = (ms: number) => {
    const year = new Date(ms).getFullYear();
    return new Date(`${year}/01/01`).valueOf()

}
export const getYear = (ms?: number) => {
    return (ms ? new Date(ms) : new Date()).getFullYear();
}

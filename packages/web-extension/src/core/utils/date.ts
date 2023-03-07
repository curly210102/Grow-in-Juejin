export const MS_OF_YEAR = 366 * 24 * 3600 * 1000;
export const MS_OF_DAY = 24 * 3600 * 1000;
export const MS_OF_30MIN = 30 * 60 * 1000;
export const format = (date: number | Date, template: string) => {
    const dateObj = new Date(date);
    const year = `${dateObj.getFullYear()}`;
    const month = `${dateObj.getMonth() + 1}`.padStart(2, "0");
    const day = `${dateObj.getDate()}`.padStart(2, "0");

    return template.replaceAll("YYYY", year).replaceAll("MM", month).replaceAll("DD", day);
}
export const addOneYear = (date: number | Date) => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    return dateObj.setFullYear(year + 1);
}
export const getLastYearRange = () => {
    const current = new Date().setHours(0, 0, 0, 0);
    return [current.valueOf() - MS_OF_YEAR, current.valueOf()]
}
export const getFullYearRange = (year: number) => {
    return [new Date(`${year}/01/01`).valueOf(), new Date(`${year}/12/31`).valueOf()];
}
export const startOfDate = (ms: number) => {
    return new Date(ms).setHours(0, 0, 0, 0)
}
export const startOfMonth = (ms: number) => {
    const date = new Date(ms)
    date.setDate(1)
    date.setHours(0, 0, 0, 0);
    return date.valueOf();
}
export const startOfYear = (ms: number) => {
    const year = new Date(ms).getFullYear();
    return new Date(`${year}/01/01`).valueOf()
}
export const getYear = (ms?: number | Date) => {
    return (ms ? new Date(ms) : new Date()).getFullYear();
}
export const getMonth = (ms?: number | Date) => {
    return (ms ? new Date(ms) : new Date()).getMonth() + 1;
}
export const getDate = (ms?: number | Date) => {
    return (ms ? new Date(ms) : new Date()).getDate();
}
export const getCurrent = () => {
    return new Date().valueOf();
}
export const daysOfMonth = (time: number | Date) => {
    const date = new Date(time);
    date.setDate(0)
    date.setHours(0, 0, 0, 0);
    return date.getDate();
}
export const prevYear = (time: number) => {
    const date = new Date(time);
    const year = date.getFullYear();
    return new Date(year - 1, 0, 1).valueOf();
}
export const nextYear = (time: number) => {
    const date = new Date(time);
    const year = date.getFullYear();
    return new Date(year + 1, 0, 1).valueOf();
}
export const prevMonth = (time: number) => {
    const date = new Date(time);
    return new Date(date.getFullYear(), date.getMonth() - 1, 1).valueOf();
}
export const nextMonth = (time: number) => {
    const date = new Date(time);
    return new Date(date.getFullYear(), date.getMonth() + 1, 1).valueOf();
}
export const isStartOfDay = (time: number) => {
    return startOfDate(time).valueOf() === time;
}
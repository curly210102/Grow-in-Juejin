export interface IActivity {
    key: string;
    desc?: string;
    figure?: string;
    startTimeStamp?: number;
    title: string;
    docLink: string;
    category: string;
    endTimeStamp?: number;
    rewards: [
        {
            title: "进度追踪";
            rewards: Array<{
                name: string;
                days: number;
            }>;
        },
        {
            title: "数量追踪";
            rewards: Array<{
                name: string;
                count: number;
            }>;
        }
    ];
    categories: string[];
    signSlogan: string;
    signLink: string;
    tagNames: [];
    wordCount: number;
}
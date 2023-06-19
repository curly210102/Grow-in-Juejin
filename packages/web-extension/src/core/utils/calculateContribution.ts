import { ActionType, UserActions } from "../types";

export default function (userActions: UserActions) {
    let score = 0;

    // 发布文章：+70
    // 点赞文章：+20
    // 关注：+10
    // 发布沸点：+10
    // 点赞沸点：+5
    score += 70 * userActions[ActionType.POST];
    score += 20 * userActions[ActionType.LKPOST];
    score += 10 * userActions[ActionType.FOLLOW];
    score += 10 * userActions[ActionType.PIN];
    score += 5 * userActions[ActionType.LKPIN];

    // 活跃度等级
    // Lv0 —— 活跃度 0
    // Lv1 —— 活跃度 [1, 20)
    // Lv2 —— 活跃度 [20, 60)
    // Lv3 —— 活跃度 [60, 80)
    // Lv4 —— 活跃度 [80, 115)

    return Math.min(score, 100);
}

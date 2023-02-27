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

    // 参与度等级
    // Lv0 —— 参与度 0
    // Lv1 —— 参与度 [1, 20)
    // Lv2 —— 参与度 [20, 60)
    // Lv3 —— 参与度 [60, 80)
    // Lv4 —— 参与度 [80, 10)

    return Math.min(score, 100);
}
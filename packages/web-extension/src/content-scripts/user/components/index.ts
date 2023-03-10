import { defineCustomElement } from 'vue'
import ClientJoinedActivity from './ClientJoinedActivity.ce.vue'
import ClientUserGrowTrending from './ClientUserGrowTrending.ce.vue'

const CustomJoinedActivity = defineCustomElement(ClientJoinedActivity)
const CustomUserGrowTrending = defineCustomElement(ClientUserGrowTrending)

// 分别导出元素
export { CustomJoinedActivity, CustomUserGrowTrending }

export function register() {
    customElements.define('joined-activity', CustomJoinedActivity)
    customElements.define('grow-trending', CustomUserGrowTrending)
}
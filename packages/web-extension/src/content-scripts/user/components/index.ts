import { defineCustomElement } from 'vue'
import ClientJoinedActivity from './ClientJoinedActivity.ce.vue'
import ClientUserTrace from './ClientUserTrace.ce.vue'

const CustomJoinedActivity = defineCustomElement(ClientJoinedActivity)
const CustomUserTrace = defineCustomElement(ClientUserTrace)

// 分别导出元素
export { CustomJoinedActivity, CustomUserTrace }

export function register() {
    customElements.define('gij-joined-activity', CustomJoinedActivity)
    customElements.define('gij-user-trace', CustomUserTrace)
}
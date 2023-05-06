import { defineCustomElement } from 'vue'
import ClientJoinedActivity from './ClientJoinedActivity.ce.vue'
import ClientUserTrace from './ClientUserTrace.ce.vue'
import ClientTagRadar from './ClientTagRadar.ce.vue'

const CustomJoinedActivity = defineCustomElement(ClientJoinedActivity)
const CustomUserTrace = defineCustomElement(ClientUserTrace)
const CustomUserTagRadar = defineCustomElement(ClientTagRadar)

// 分别导出元素
export { CustomJoinedActivity, CustomUserTrace, CustomUserTagRadar }

export function register() {
    customElements.define('gij-joined-activity', CustomJoinedActivity)
    customElements.define('gij-user-trace', CustomUserTrace)
    customElements.define('gij-tag-radar', CustomUserTagRadar)
}
import { defineCustomElement } from 'vue'
import ClientJoinedActivity from './ClientJoinedActivity.ce.vue'

const CustomJoinedActivity = defineCustomElement(ClientJoinedActivity)

// 分别导出元素
export { CustomJoinedActivity }

export function register() {
    customElements.define('joined-activity', CustomJoinedActivity)
}
import { defineCustomElement } from 'vue'
import ClientActivityOngoing from './ClientActivityOngoing.ce.vue'

const CustomActivityOngoing = defineCustomElement(ClientActivityOngoing)

// 分别导出元素
export { CustomActivityOngoing }

export function register() {
    customElements.define('gij-ongoing-activity', CustomActivityOngoing)
}
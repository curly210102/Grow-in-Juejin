import { defineCustomElement } from 'vue'
import ClientActivityOngoing from './ClientActivityOngoing.ce.vue'
import ClientActivityJoint from './ClientActivityJoint.ce.vue'

const CustomActivityOngoing = defineCustomElement(ClientActivityOngoing)
const CustomActivityJoint = defineCustomElement(ClientActivityJoint)

// 分别导出元素
export { CustomActivityOngoing, CustomActivityJoint }

export function register() {
    customElements.define('gij-ongoing-activity', CustomActivityOngoing)
    customElements.define('gij-joint-activity', CustomActivityJoint)
}
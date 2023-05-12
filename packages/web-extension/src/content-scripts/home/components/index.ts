import { defineCustomElement } from 'vue'
import ClientActivityFloating from './ClientActivityFloating.ce.vue'
import '@webcomponents/webcomponentsjs/webcomponents-bundle'

const CustomActivityFloating = defineCustomElement(ClientActivityFloating)

// 分别导出元素
export { CustomActivityFloating }

export function register() {
    customElements.define('gij-floating-activity', CustomActivityFloating)
}
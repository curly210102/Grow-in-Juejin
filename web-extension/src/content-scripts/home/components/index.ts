import '@webcomponents/webcomponentsjs/webcomponents-bundle'
import { defineCustomElement } from 'vue'
import ClientActivityFloating from './ClientActivityFloating.ce.vue'

const CustomActivityFloating = defineCustomElement(ClientActivityFloating)

// 分别导出元素
export { CustomActivityFloating }

export function register() {
    customElements.define('gij-floating-activity', CustomActivityFloating)
}
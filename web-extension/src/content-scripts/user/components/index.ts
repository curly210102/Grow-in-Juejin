import '@webcomponents/webcomponentsjs/webcomponents-bundle'
import { defineCustomElement } from 'vue'
import ClientJoinedArticleActivity from './ClientJoinedArticleActivity.ce.vue'
import ClientUserTrace from './ClientUserTrace.ce.vue'
import ClientTagRadar from './ClientTagRadar.ce.vue'


const CustomJoinedArticleActivity = defineCustomElement(ClientJoinedArticleActivity)
const CustomUserTrace = defineCustomElement(ClientUserTrace)
const CustomUserTagRadar = defineCustomElement(ClientTagRadar)

// 分别导出元素
export { CustomJoinedArticleActivity, CustomUserTrace, CustomUserTagRadar }

export function register() {
    customElements.define('gij-joined-article-activity', CustomJoinedArticleActivity)
    customElements.define('gij-user-trace', CustomUserTrace)
    customElements.define('gij-tag-radar', CustomUserTagRadar)
}
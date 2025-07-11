import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
	{ path: '/', component: () => import('./view/base.vue') },
	{ path: '/quality', component: () => import('./view/quality.vue') },
	{ path: '/hls', component: () => import('./view/hls.vue') },
	{ path: '/multiple', component: () => import('./view/multiple.vue') },
	{ path: '/scroll', component: () => import('./view/scroll.vue') }
]

export default new VueRouter({
	routes
})

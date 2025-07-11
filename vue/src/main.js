import Vue from 'vue'
import router from './router'

import Mirror from '../player/index.js'
import App from './app.vue'

Vue.use(Mirror)

new Vue({
	router,
	render: h => h(App)
}).$mount('#app')

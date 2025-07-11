import Mirror from './player.vue'

const install = Vue => {
	Vue.component('mirror', Mirror)
}

if (typeof window !== 'undefined' && window.Vue !== undefined) {
	install(window.Vue)
}

Mirror.install = install

export default Mirror

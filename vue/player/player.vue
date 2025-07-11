<template>
	<div>
		<div ref="title">
			<slot />
		</div>
	</div>
</template>

<script>
import Mirror from '../../src/js/index'

export default {
	name: 'Mirror',
	props: {
		src: {
			type: [String, Object, Array],
			default: undefined
		},
		autoplay: {
			type: Boolean,
			default: false
		},
		loop: {
			type: Boolean,
			default: false
		},
		muted: {
			type: Boolean,
			default: true
		},
		preload: {
			type: String,
			default: 'none'
		},
		poster: {
			type: String,
			default: undefined
		},
		controls: {
			type: Boolean,
			default: true
		},
		title: {
			type: String,
			default: undefined
		},
		head: {
			type: Number,
			default: 1
		},
		fullType: {
			type: String,
			default: 'native'
		},
		live: {
			type: Boolean,
			default: false
		},
		durationFormat: {
			type: String,
			default: 'total'
		},
		mutex: {
			type: Boolean,
			default: true
		},
		report: {
			type: Boolean,
			default: false
		},
		floatBarAutoHide: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			player: undefined
		}
	},
	watch: {
		floatBarAutoHide(nVal) {
			this.player && (this.player.floatBarAutoHide = nVal)
		},
		currentTime(nVal) {
			this.player && (this.player.currentTime = nVal)
		},
		currentQuality(nVal) {
			this.player && (this.player.currentQuality = nVal)
		},
		muted(nVal) {
			this.player && (this.player.muted = nVal)
		},
		src(nVal) {
			this.player && (this.player.src = nVal)
		}
	},
	mounted() {
		this.player = new Mirror(this.$el, {
			...this.$props
		})

		// 绑定事件
		const bindEvent = () => {
			// video原生事件
			;[
				'abort',
				'canplay',
				'canplaythrough',
				'durationchange',
				'emptied',
				'ended',
				'error',
				'loadeddata',
				'loadedmetadata',
				'loadstart',
				'mozaudioavailable',
				'pause',
				'play',
				'playing',
				'progress',
				'ratechange',
				'seeked',
				'seeking',
				'stalled',
				'suspend',
				'timeupdate',
				'volumechange',
				'waiting'
			].forEach(evt => {
				this.player.$on(evt, detail => {
					this.$emit('__' + evt + '__', detail)
				})
			})

			// 自定义事件
			;[
				'ready',
				'play',
				'pause',
				'point',
				'sourcechange',
				'volumechange',
				'fullscreenchange',
				'durationchange',
				'waiting',
				'destroy',
				'error'
			].forEach(evt => {
				this.player.on(evt, detail => {
					this.$emit(evt, detail)
				})
			})
		}

		// 挂载自定义标题
		const mountCustomTitle = () => {
			if (this.head === 0) {
				return
			}
			const container = this.$refs.title
			const slotContent = container.children[0]
			if (slotContent) {
				const template = this.player.template
				template.headTitle.innerHTML = slotContent.outerHTML
			}
		}

		bindEvent()
		this.$nextTick(mountCustomTitle)
	},
	methods: {
		play() {
			this.player.play()
		},
		pause() {
			this.player.pause()
		},
		requestFullscreen() {
			this.player.requestFullscreen()
		},
		exitFullscreen() {
			this.player.exitFullscreen()
		}
	}
}
</script>

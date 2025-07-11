<template>
	<div class="wrapper">
		<div>
			<mirror
				ref="mirror"
				:src="resource[currentIndex]"
				:poster="poster"
				:autoplay="true"
				:report="true"
				preload="metadata"
				full-type="dom"
				@ready="detail => drawLog('ready', detail)"
				@networkchange="detail => drawLog('networkchange', detail)"
				@fullscreenchange="detail => drawLog('fullscreenchange', detail)"
				@durationchange="detail => drawLog('durationchange', detail)"
				@waiting="detail => drawLog('waiting', detail)"
				@volumechange="detail => drawLog('volumechange', detail)"
				@play="detail => drawLog('play', detail)"
				@pause="detail => drawLog('pause', detail)"
				@point="detail => drawLog('point', detail)"
				@error="detail => drawLog('error', detail)"
			>
				<p class="title">标题内容</p>
			</mirror>
		</div>
		<div class="menu-list">
			<button class="btn" @click="onSwitcVideo">切换视频</button>
		</div>
		<div ref="log" class="log" />
	</div>
</template>

<script>
export default {
	data() {
		return {
			player: undefined,
			poster: 'https://img0.baidu.com/it/u=3443610860,3904946242&fm=253&fmt=auto&app=138&f=JPEG?w=1069&h=800',
			resource: ['http://vjs.zencdn.net/v/oceans.mp4'],
			currentIndex: 0
		}
	},
	mounted() {
		const nativeEvents = ['durationchange', 'volumechange']

		for (let i = 0; i < nativeEvents.length; i++) {
			this.$refs.mirror.player.$on(nativeEvents[i], evt => {
				this.drawLog(nativeEvents[i], ': ', evt)
			})
		}
	},
	methods: {
		drawLog(name, info) {
			const eventsEle = this.$refs.log

			eventsEle.innerHTML += `<p>Event: ${name} ${info ? `Data: <span>${JSON.stringify(info)}</span>` : ''}</p>`
			eventsEle.scrollTop = eventsEle.scrollHeight
		},
		onSwitcVideo() {
			this.src = this.resource[(this.currentIndex = this.currentIndex === 0 ? 1 : 0)]
		}
	}
}
</script>

<style lang="less" scoped>
.title {
	color: #ff0000;
	font-size: 51px;
}

.wrapper {
	width: 100%;

	svg {
		width: 100px;
		height: 100px;
	}

	.menu-list {
		text-align: left;
	}

	.log {
		margin-top: 30px;
		width: 100%;
		text-align: left;
		height: 600px;
		overflow: scroll;
		font-size: 36px;
	}
}
</style>

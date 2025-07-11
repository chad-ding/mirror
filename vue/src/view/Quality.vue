<template>
	<div class="wrapper">
		<div>
			<div ref="player" />
		</div>
		<div ref="log" class="log" />
	</div>
</template>

<script>
import Mirror from '../../../src/js/index.js'

export default {
	data() {
		return {
			player: undefined
		}
	},
	mounted() {
		this.player = new Mirror(this.$refs.player, {
			live: true,
			autoplay: false,
			controls: true,
			durationFormat: 'remain',
			fullType: 'dom',
			title: '大海',
			poster: 'https://img0.baidu.com/it/u=3443610860,3904946242&fm=253&fmt=auto&app=138&f=JPEG?w=1069&h=800',
			src: {
				quality: [
					{
						label: '超清',
						url: '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-720p.mp4'
					},
					{
						label: '高清',
						url: '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-480p.mp4'
					},
					{
						label: '标清',
						url: '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4'
					}
				]
			}
		})

		const customEvents = [
			'networkchange',
			'fullscreenchange',
			'durationchange',
			'waiting',
			'volumechange',
			'play',
			'pause',
			'point',
			'ready'
		]
		const nativeEvents = ['durationchange', 'volumechange']

		const eventsEle = this.$refs.log
		const drawLog = (name, info) => {
			eventsEle.innerHTML += `<p>Event: ${name} ${info ? `Data: <span>${JSON.stringify(info)}</span>` : ''}</p>`
			eventsEle.scrollTop = eventsEle.scrollHeight
		}

		for (let i = 0; i < customEvents.length; i++) {
			this.player.on(customEvents[i], info => drawLog(customEvents[i], info))
		}

		for (let i = 0; i < nativeEvents.length; i++) {
			this.player.$on(nativeEvents[i], info => {
				console.log(nativeEvents[i], ': ', info)
			})
		}
	}
}
</script>

<style lang="less" scoped>
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

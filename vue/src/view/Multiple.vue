<template>
	<div class="wrap">
		<div ref="player1" class="player"></div>
		<div ref="player2" class="player"></div>
		<div ref="player3" class="player"></div>
	</div>
</template>

<script>
import Mirror from '../../../src/js/index.js'

export default {
	mounted() {
		this.player1 = new Mirror(this.$refs.player1, {
			poster: 'https://img0.baidu.com/it/u=3443610860,3904946242&fm=253&fmt=auto&app=138&f=JPEG?w=1069&h=800',
			src: 'http://vjs.zencdn.net/v/oceans.mp4'
		})

		this.player2 = new Mirror(this.$refs.player2, {
			poster: 'http://shp.qpic.cn/cfwebcap/0/23520229f441312d4f550d902382f77b/0/?width=500&height=270&mime=.jpg',
			src: {
				quality: [
					{
						url: 'http://vjs.zencdn.net/v/oceans.mp4',
						label: '高清'
					},
					{
						url: 'http://vjs.zencdn.net/v/oceans.mp4',
						label: '超清'
					}
				],
				defaultQuality: 1
			}
		})

		this.player3 = new Mirror(this.$refs.player3, {
			title: '直播',
			live: true,
			poster: 'https://img0.baidu.com/it/u=3443610860,3904946242&fm=253&fmt=auto&app=138&f=JPEG?w=1069&h=800',
			src: '//test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
		})
	}
}
</script>

<style lang="less" scoped>
.player {
	& + .player {
		margin-top: 60px;
	}
}
</style>

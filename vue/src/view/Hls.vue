<template>
	<div class="base"></div>
</template>

<script>
import Mirror from '../../../src/js/index.js'

export default {
	mounted() {
		this.player = new Mirror(this.$el, {
			preload: 'none',
			src: {
				quality: [
					{
						label: 'SD',
						url: '//test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
					}
				],
				defaultQuality: 0,
				pic: '//i.loli.net/2019/06/06/5cf8c5d9c57b510947.png'
			}
		})

		this.player.on('sourcechange', data => {
			console.log(data)
		})
	}
}
</script>

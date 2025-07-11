<template>
	<div class="wrapper">
		<div class="head"></div>
		<div>
			<div ref="player" />
		</div>
		<div class="tail"></div>
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
			live: false,
			autoplay: false,
			controls: true,
			durationFormat: 'remain',
			fullType: 'dom',
			poster: 'https://img0.baidu.com/it/u=3443610860,3904946242&fm=253&fmt=auto&app=138&f=JPEG?w=1069&h=800',
			src: 'http://vjs.zencdn.net/v/oceans.mp4'
		})
	}
}
</script>

<style lang="less" scoped>
.wrapper {
	width: 100%;
	height: 100%;
	overflow: scroll;

	.head {
		width: 100%;
		height: 2400px;
	}

	.tail {
		width: 100%;
		height: 300px;
	}
}
</style>

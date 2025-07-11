<template>
	<div class="root">
		<ul class="menu">
			<li>
				<router-link :class="{ active: $route.path === '/' }" to="/">Basic</router-link>
			</li>
			<li>
				<router-link :class="{ active: $route.path === '/quality' }" to="/quality">Quality</router-link>
			</li>
			<li>
				<router-link :class="{ active: $route.path === '/hls' }" to="/hls">Hls</router-link>
			</li>
			<li>
				<router-link :class="{ active: $route.path === '/multiple' }" to="/multiple">Multiple</router-link>
			</li>
			<li>
				<router-link :class="{ active: $route.path === '/scroll' }" to="/scroll">Scroll</router-link>
			</li>
		</ul>
		<router-view></router-view>
	</div>
</template>

<script>
export default {
	name: 'App'
}
</script>

<style lang="less">
@import '../../src/css/index.less';

.root {
	width: 100%;
	height: 100%;
}

.btn {
	border: 9px solid transparent;
	color: #fff;
	font-size: 39px;
	line-height: 1;
	background: #409eff border-box;
	border-radius: 12px;
	outline: none;
	padding: 21px 42px;
	text-align: center;
	white-space: nowrap;
}

#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	padding: 60px 48px 0;
	width: 100%;
	height: 100%;
}

.menu {
	list-style: none;
	margin-bottom: 24px;
	text-align: left;
	overflow: scroll;
	white-space: nowrap;
	padding: 0 48px;

	li {
		list-style: none;
		display: inline-block;
		padding: 3px 6px;
		font-size: 60px;

		& + li {
			margin-left: 24px;
		}
	}

	a {
		text-decoration: none;
		color: #333;

		&.active {
			color: #409eff;
			font-weight: bold;
		}
	}
}
</style>

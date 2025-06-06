;(function () {
	function isScreenLandscape() {
		if (screen.orientation && typeof screen.orientation.angle === 'number') {
			return Math.abs(screen.orientation.angle) === 90
		}
		if (typeof window.orientation === 'number') {
			return Math.abs(window.orientation) === 90
		}
		if (screen.availWidth && screen.availHeight) {
			return screen.availWidth > screen.availHeight
		}
return screen.width > screen.height
	}
	function onOrientationChange(options) {
		var callback = options.callback
		var immediate = !!options.immediate
		var isLandscape = isScreenLandscape()
		var supportOrientationchange = 'onorientationchange' in window

		function listener() {
			var currentIslandscape = isScreenLandscape()

			if (supportOrientationchange) {
				var viewportWidth = document.documentElement.clientWidth
				var viewportHeight = document.documentElement.clientHeight

				if (
					(currentIslandscape && viewportWidth <= viewportHeight) ||
					(!currentIslandscape && viewportWidth > viewportHeight)
				) {
					window.addEventListener('resize', function listener() {
						window.removeEventListener('resize', listener)
						callback(currentIslandscape)
					})
					return
				}
				callback(currentIslandscape)
				return
			}
			if (currentIslandscape === isLandscape) {
				return
			}
			isLandscape = currentIslandscape
			callback(isLandscape)
		}
		if (immediate) {
			callback(isLandscape)
		}

		window.addEventListener(supportOrientationchange ? 'orientationchange' : 'resize', listener)
		return function () {
			window.removeEventListener(
				supportOrientationchange ? 'orientationchange' : 'resize',
				listener
			)
		}
	}
	function getViewportScale() {
		var viewport = document.querySelector('meta[name=viewport]')
		var scale = 1

		if (viewport) {
			var content = viewport.getAttribute('content')
			scale = parseFloat(
				(content && content.replace(/^.*\binitial-scale\s*=\s*([\d.]+).*$|^.*$/, '$1')) ||
					'1'
			)
		}

		var viewportWidth = document.documentElement.clientWidth || window.innerWidth
		var windowWidth = window.outerWidth || window.screen.availWidth || window.screen.width

		return windowWidth / viewportWidth - scale < 0.1 ? scale : 1
	}

	function setRem(isLandscape) {
		var scale = 1
		var meta = document.querySelector('head > meta[name=viewport]')

		if (!meta) {
			meta = document.createElement('meta')
			meta.setAttribute('name', 'viewport')
			document.head.appendChild(meta)
		}

		meta.setAttribute(
			'content',
			'width=device-width,initial-scale=' +
				scale +
				',maximum-scale=' +
				scale +
				',minimum-scale=' +
				scale +
				',user-scalable=no'
		)

		var viewportWidth = document.documentElement.clientWidth
		var viewportHeight = document.documentElement.clientHeight
		var pageWidth = !isLandscape
			? viewportWidth
			: Math.min(viewportWidth, Math.max(viewportHeight, 360 / getViewportScale()))

		var ui = viewportWidth >= 1278 ? 16 : 10.8
		document.documentElement.style.fontSize = ((100 / ui) * pageWidth) / viewportWidth + 'vw'
	}

	if (document.documentElement.clientWidth > 0) {
		onOrientationChange({
			immediate: true,
			callback: setRem
		})
	} else {
		setTimeout(() => {
			onOrientationChange({
				immediate: true,
				callback: setRem
			})
		}, 1000)
	}
})()

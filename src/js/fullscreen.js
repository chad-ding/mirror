import utils from './utils';
import Icons from './icons';

const requestFullscreen =
    document.body.requestFullscreen ||
    document.body.mozRequestFullScreen ||
    document.body.webkitRequestFullscreen ||
    document.body.webkitEnterFullscreen ||
    document.body.webkitEnterFullScreen ||
    document.body.msRequestFullscreen;

const cancelFullScreen =
    document.cancelFullScreen ||
    document.mozCancelFullScreen ||
    document.webkitCancelFullScreen ||
    document.webkitCancelFullscreen ||
    document.msCancelFullScreen ||
    document.msExitFullscreen;

export default class {
    constructor(player) {
        player.isFullscreen = this.isFullscreen.bind(this);
        player.isDomRotated = this.isDomRotated.bind(this);

        this.player = player;
        this.fullType = player.options.fullType || 'native'; // 全屏切换模式，仅在游戏中心支持web模式

        // 保存父节点
        if (this.fullType === 'dom') {
            this.wrapper = this.player.container.parentElement;
        }

        if (/Firefox/.test(navigator.userAgent)) {
            document.addEventListener('mozfullscreenchange', this.onDocFullscreenChange.bind(this));
            document.addEventListener('fullscreenchange', this.onDocFullscreenChange.bind(this));
        } else {
            this.player.container.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
            this.player.container.addEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
            document.addEventListener('msfullscreenchange', this.onDocFullscreenChange.bind(this));
            document.addEventListener('MSFullscreenChange', this.onDocFullscreenChange.bind(this));
        }

        this.initSize();
    }

    get videoWidth() {
        return this.player.video.videoWidth;
    }

    get videoHeight() {
        return this.player.video.videoHeight;
    }

    onFullscreenChange() {
        this.doFullscreenChange();
    }

    onDocFullscreenChange() {
        const fullEle = document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        if (fullEle && fullEle !== this.player.container) {
            return;
        }

        doFullscreenChange();
    }

    doFullscreenChange() {
        const fullscreen = this.isFullscreen();
        this.switchFullIcon(fullscreen);
        this.player.events.trigger('fullscreenchange', { fullscreen });

        const container = this.player.container;
        // 切换到横屏
        if (fullscreen && container.clientWidth > container.clientHeight) {
            container.classList.add('mirror-fullscreen-horizontal');
        } else {
            container.classList.remove('mirror-fullscreen-horizontal');
        }

        // 低版本机型requestFullscreen会出现渲染中断的问题，需要手动触发渲染
        const toggle = () => {
            const fn = fullscreen ? 'show' : 'hide';
            this.player.head[fn]();
        };

        if (utils.isMobile) {
            if (!isNaN(utils.androidVersion) && utils.androidVersion < 9) {
                setTimeout(() => toggle(), 300);
            } else {
                requestAnimationFrame(() => toggle());
            }
        } else {
            toggle();
        }
    }

    switchFullIcon(isFull) {
        // 更改全屏按钮
        const icon = isFull ? Icons.fullExit : Icons.full;
        this.player.template.fullButton && (this.player.template.fullButton.innerHTML = icon);
    }

    isFullscreen() {
        if (this.fullType === 'dom') {
            return this.player.container.classList.contains('mirror-fullscreen-dom');
        }
        return !!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    }

    request() {
        if (this.isFullscreen()) {
            return;
        }
        this.player.container.classList.add('mirror-fullscreen');

        if (this.fullType === 'native') {
            requestFullscreen.call(this.player.container);
            return;
        }

        const ele = this.player.container;
        const width = this.screenWidth;
        const height = this.screenHeight;

        let styleText = this.formatStyleText({
            width: `${width}px`,
            height: `${height}px`,
            position: 'fixed',
            top: '0',
            let: '0',
            overflow: 'hidden',
            'box-sizing': 'border-box',
            'z-index': '999'
        });
        ele.classList.add('mirror-fullscreen-dom');

        // 设备不支持自动横竖屏切换 & 容器高度大于宽度 & 视频宽度大于高度
        if (height > width && this.videoWidth > this.videoHeight) {
            styleText = this.formatStyleText({
                width: `${height}px`,
                height: `${width}px`,
                'margin-top': `-${width / 2}px`,
                'margin-left': `-${height / 2}px`,
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'rotate(90deg)',
                'z-index': '999',
                'box-sizing': 'border-box'
            });
        }

        ele.style.cssText = styleText;
        document.body.appendChild(ele);
        window.history.pushState({ fullscreen: Date.now() }, '');

        const cancelFullscreen = () => {
            window.history.back();
            this.cancel();

            window.removeEventListener('popstate', cancelFullscreen);
            window.removeEventListener('orientationchange', this.onOrientationChange);
        };

        window.addEventListener('popstate', cancelFullscreen);
        window.addEventListener('orientationchange', this.onOrientationChange.bind(this));

        this.doFullscreenChange();
    }

    cancel() {
        if (!this.isFullscreen()) {
            return;
        }
        const ele = this.player.container;
        ele.classList.remove('mirror-fullscreen');

        if (this.fullType === 'native') {
            cancelFullScreen.call(document);
            return;
        } else {
            ele.style.cssText = '';
            this.wrapper.appendChild(ele);
            ele.classList.remove('mirror-fullscreen-dom');

            this.doFullscreenChange();
        }
    }

    // 是否通过dom方法旋转实现了全屏
    isDomRotated() {
        const ele = this.player.container;
        return !!ele.style.cssText && ele.style.cssText.indexOf('rotate(90deg)') !== -1;
    }

    onOrientationChange() {
        this.initSize(); // 重新获取宽高，判断是否需要切换横屏

        if (!this.isFullscreen()) return; // 非全屏下旋转屏幕不设置style

        const width = this.screenWidth;
        const height = this.screenHeight;
        const ele = this.player.container;

        // 横屏
        let cssText;
        if (Math.abs((window.orientation / 90) % 2) === 1) {
            cssText = this.formatStyleText({
                width: `${height}px`,
                height: `${width}px`,
                'margin-top': `-${width / 2}px`,
                'margin-left': `-${height / 2}px`,
                position: 'fixed',
                top: '50%',
                left: '50%',
                'z-index': '9',
                'box-sizing': 'border-box'
            });
        } else {
            cssText = this.formatStyleText({
                width: `${width}px`,
                height: `${height}px`,
                position: 'fixed',
                top: '0',
                let: '0',
                overflow: 'hidden',
                'box-sizing': 'border-box',
                'z-index': '99'
            });
        }

        ele.style.cssText = cssText;
    }

    initSize() {
        const scaled = !/initial-scale=1(\.0)?/.test(document.head.querySelector('meta[name="viewport"]').content);
        const _devicePixelRatio = window.devicePixelRatio === 4 || !scaled ? 1 : window.devicePixelRatio;

        this.screenWidth = window.screen.width * _devicePixelRatio;
        this.screenHeight = window.screen.height * _devicePixelRatio;
    }

    toggle() {
        if (this.isFullscreen()) {
            this.cancel();
        } else {
            this.request();
        }
    }

    formatStyleText(styleMap) {
        let result = '';
        Object.entries(styleMap).forEach((item) => {
            result += `${item[0]}:${item[1]};`;
        });

        return result;
    }

    destroy() {
        if (/Firefox/.test(navigator.userAgent)) {
            document.removeEventListener('mozfullscreenchange', this.onDocFullscreenChange);
            document.removeEventListener('fullscreenchange', this.onDocFullscreenChange);
        } else {
            this.player.container.removeEventListener('fullscreenchange', this.onFullscreenChange);
            this.player.container.removeEventListener('webkitfullscreenchange', this.onFullscreenChange);
            document.removeEventListener('msfullscreenchange', this.onDocFullscreenChange);
            document.removeEventListener('MSFullscreenChange', this.onDocFullscreenChange);
        }
    }
}

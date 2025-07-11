import Engine from './engine';

export default class extends Engine {
    constructor(container, options) {
        super(container, options);

        console.info('mirror: 版本号(', process.env.mirror_VERSION || '', '); 编译时间(', process.env.BUILD_DATE || '', ')');
    }

    // 设置进度
    set currentTime(time) {
        this.__seek__(time);
    }

    // 读取进度
    get currentTime() {
        return this.video.currentTime;
    }

    get fullscreen() {
        return this.fullScreen.isFullscreen();
    }

    get videoWidth() {
        return this.video.videoWidth;
    }

    get videoHeight() {
        return this.video.videoHeight;
    }

    get duration() {
        return this.video.duration;
    }

    get currentQuality() {
        return this.qualityIndex;
    }

    get src() {
        return this.options.src;
    }

    set src(src) {
        this.__pause__();

        if (typeof src === 'string') {
            this.options.src = {
                url: src
            };
        } else if (src.quality) {
            const { quality, defaultQuality } = src;

            if (isNaN(defaultQuality) || defaultQuality < 0 || defaultQuality > quality.length) {
                src.defaultQuality = 0;
            }

            const defaultSource = quality[src.defaultQuality];
            defaultSource.type && (src.type = defaultSource.type);

            src.url = defaultSource.url;
            this.options.src = src;
            this.qualityIndex = src.defaultQuality;
        } else {
            this.options.src = src;
        }

        this.video.src = this.options.src.url;
        this.__initMSE__(this.video, this.options.src.type || 'auto');

        this.controller.show();
        this.controller.initQualityButton();
        this.controller.setAutoHide();
        this.bar.set('played', 0, 'width');
    }

    get muted() {
        return this.video.muted;
    }

    set muted(muted) {
        console.info('切换静音模式: ', muted);
        if (muted === undefined) {
            this.options.muted = this.video.muted = !this.video.muted;
        } else {
            this.options.muted = this.video.muted = !!muted;
        }

        this.controller.switchMuteIcon(this.options.muted);
    }

    get volume() {
        return this.video.volume;
    }

    set volume(num) {
        console.info('设置音量: ', num);
        if (isNaN(num) || num > 1 || num < 0) {
            console.error('音量值必须是0-1之间的数字');
        }

        this.video.volume = num;
    }

    get floatBarAutoHide() {
        return this.options.floatBarAutoHide;
    }

    set floatBarAutoHide(autoHide) {
        this.options.floatBarAutoHide = autoHide;
        this.controller.setAutoHide(!!autoHide);
    }

    get el() {
        return this.container;
    }

    play() {
        super.__play__();
    }

    pause() {
        super.__pause__();
    }

    requestFullscreen() {
        this.fullScreen.request();
    }

    exitFullscreen() {
        this.fullScreen.cancel();
    }

    // 监听封装事件
    on(name, callback) {
        this.events.on(name, callback, false);
    }

    off(name, callback) {
        this.events.off(name, callback, false);
    }

    // 监听原始事件
    $on(name, callback) {
        this.events.on(name, callback, true);
    }

    $off(name, callback) {
        this.events.off(name, callback, true);
    }

    destroy() {
        instances.splice(instances.indexOf(this), 1);
        this.__pause__();
        document.removeEventListener('click', this.docClickFun, true);
        this.container.removeEventListener('click', this.containerClickFun, true);

        this.fullScreen.destroy();
        this.controller.destroy();
        this.loadingDetect.destroy();

        this.video.src = '';
        this.container.innerHTML = '';
        this.events.trigger('destroy');
    }

    // 播放器版本
    static get version() {
        return process.env.PLAYER_VERSION;
    }
}

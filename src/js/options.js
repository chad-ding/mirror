import { DisplayRule } from './head';

export default (options) => {
    // 默认设置
    const defaultOption = {
        container: options.element || document.getElementsByClassName('mirror')[0],
        autoplay: false, // 是否自动播放
        loop: false, // 是否循环播放
        preload: 'metadata', // 预加载模式
        muted: true, // 是否静音
        /**
         * url: 视频地址
         * quality: 清晰度
         * defaultQuality: 0
         */
        src: {},
        durationFormat: 'total', // 进度条时长（total：总时长；remain：剩余时长）
        fullType: 'native', // 全屏切换方式（native：调用浏览器requestFullscreen方法实现；dom：修改dom样式实现）
        live: false, // 是否直播，直播不显示播放进度
        title: undefined, // 视频标题文案
        head: DisplayRule.FullScreen, // 视频标题栏显示规则：0（不显示标题栏）；1（只在全屏模式下显示标题栏）；2（所有模式下都显示标题栏）
        floatBarAutoHide: true, // 自动隐藏悬浮组件
        mutex: true, // 多视频场景声道唯一
        controls: true, // 是否显示控制栏
        report: false, // 是否开启埋点上报
        lang: (navigator.language || navigator.browserLanguage).toLowerCase(),
        pluginOptions: { hls: {}, flv: {}, dash: {}, webtorrent: {} }
    };

    for (const defaultKey in defaultOption) {
        if (defaultKey === 'src' && typeof options.src === 'string') {
            options.src = {
                url: options.src
            };
        }

        if (defaultOption.hasOwnProperty(defaultKey) && options[defaultKey] === undefined) {
            options[defaultKey] = defaultOption[defaultKey];
        }
    }

    if (options.src) {
        !options.src.type && (options.src.type = 'auto');
    }

    if (options.src.quality) {
        const { quality, defaultQuality } = options.src;

        if (isNaN(defaultQuality) || defaultQuality < 0 || defaultQuality > quality.length - 1) {
            options.src.defaultQuality = 0;
        }

        const defaultSource = options.src.quality[options.src.defaultQuality];
        defaultSource.type && (options.src.type = defaultSource.type);

        options.src.url = defaultSource.url;
    }

    if (options.lang) {
        options.lang = options.lang.toLowerCase();
    }

    return options;
};

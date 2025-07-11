/*
W3C def language codes is :
    language-code = primary-code ( "-" subcode )
        primary-code    ISO 639-1   ( the names of language with 2 code )
        subcode         ISO 3166    ( the names of countries )

NOTE: use lowercase to prevent case typo from user!
Use this as shown below..... */

function i18n(lang) {
    this.lang = lang;
    // in case someone says en-us, and en is present!
    this.fallbackLang = this.lang.includes('-') ? this.lang.split('-')[0] : this.lang;
    this.tran = (key) => {
        key = key.toLowerCase();
        if (tranTxt[this.lang] && tranTxt[this.lang][key]) {
            return tranTxt[this.lang][key];
        } else if (tranTxt[this.fallbackLang] && tranTxt[this.fallbackLang][key]) {
            return tranTxt[this.fallbackLang][key];
        } else if (standard[key]) {
            return standard[key];
        } else {
            return key;
        }
    };
}

// Standard english translations
const standard = {
    top: 'Top',
    bottom: 'Bottom',
    rolling: 'Rolling',
    'about-author': 'About author',
    'mirror-feedback': 'mirror feedback',
    'about-mirror': 'About Mirror',
    loop: 'Loop',
    normal: 'Normal',
    'video-failed': 'Video load failed',
    'switching-quality': 'Switching to %q quality',
    'switched-quality': 'Switched to %q quality',
    ff: 'FF %s s',
    rew: 'REW %s s',
    fullscreen: 'Full screen',
    'web-fullscreen': 'Web full screen',
    send: 'Send',
    off: 'Off',
    volume: 'Volume',
    live: 'Live',
    'video-info': 'Video info'
};

// add translation text here
const tranTxt = {
    en: standard,
    'zh-cn': {
        top: '顶部',
        bottom: '底部',
        rolling: '滚动',
        'about-author': '关于作者',
        'mirror-feedback': '播放器意见反馈',
        'about-mirror': '关于 mirror 播放器',
        loop: '洗脑循环',
        normal: '正常',
        'video-failed': '视频加载失败',
        'switching-quality': '正在切换至 %q 画质',
        'switched-quality': '已经切换至 %q 画质',
        ff: '快进 %s 秒',
        rew: '快退 %s 秒',
        fullscreen: '全屏',
        'web-fullscreen': '页面全屏',
        send: '发送',
        off: '关闭',
        'show-subs': '显示字幕',
        'hide-subs': '隐藏字幕',
        volume: '音量',
        live: '直播',
        'video-info': '视频统计信息'
    }
};

export { i18n };

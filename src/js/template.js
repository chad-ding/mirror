import Icons from './icons';
import tplPlayer from '../template/player.art';
import utils from './utils';

export default class {
    constructor(container, options) {
        this.container = container;
        this.options = options.options;
        this.index = options.index;
        this.tran = options.tran;
        this.init();
    }

    init() {
        this.container.innerHTML = tplPlayer({
            options: this.options,
            index: this.index,
            tran: this.tran,
            icons: Icons,
            mobile: utils.isMobile,
            video: {
                current: true,
                poster: this.options.poster,
                preload: this.options.preload,
                url: this.options.src.url,
                id: `video_${Date.now()}`
            }
        });

        this.head = this.container.querySelector('.mirror-head');
        this.headBackIcon = this.container.querySelector('.mirror-head-back');
        this.headTitle = this.container.querySelector('.mirror-head-title');

        // 视频播放错误
        this.errorPanel = this.container.querySelector('.mirror-error');
        this.errorBtn = this.container.querySelector('.mirror-error-btn');

        // video标签
        this.videoWrap = this.container.querySelector('.mirror-video-wrap');
        this.video = this.container.querySelector('.mirror-video-current');

        // 底部控制栏
        this.controller = this.container.querySelector('.mirror-controller');

        // 禁音控制
        this.volumeIcon = this.container.querySelector('.mirror-volume-icon');
        this.playIcon = this.container.querySelector('.mirror-play-icon');

        // 播放进度
        this.playedBar = this.container.querySelector('.mirror-played');
        this.loadedBar = this.container.querySelector('.mirror-loaded');
        this.playerBar = this.container.querySelector('.mirror-bar');
        this.ptime = this.container.querySelector('.mirror-ptime');
        this.dtime = this.container.querySelector('.mirror-dtime');
        this.playedWrap = this.container.querySelector('.mirror-bar-wrap');

        // 清晰度切换
        this.qualityMask = this.container.querySelector('.mirror-quality-mask');
        this.qualityList = this.container.querySelector('.mirror-quality-list');
        this.qualityButton = this.container.querySelector('.mirror-quality-icon');

        // 全屏
        this.fullButton = this.container.querySelector('.mirror-full-icon');
        this.bezel = this.container.querySelector('.mirror-bezel');

        // 播放按钮
        this.bezelPlayIcon = this.container.querySelector('.mirror-bezel-icon');
        this.bezelPlayedBar = this.container.querySelector('.mirror-bezel-progress-bar-played');
    }
}

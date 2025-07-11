import utils from './utils';
import Icons from './icons';

export default class {
    constructor(player) {
        this.player = player;
        this.autoHideTimer = undefined;
        this.autoHide = player.options.floatBarAutoHide;

        // 点击播放器区域显示/隐藏悬浮组件
        this.player.container.addEventListener('click', () => {
            const qualityMask = this.player.template.qualityMask;
            qualityMask && qualityMask.classList.remove('show');

            this.toggleFloatComponents();
        });

        // 开始播放自动隐藏悬浮组件
        this.player.on('play', () => {
            this.toggleFloatComponents();
        });

        // 视频暂停自动显示悬浮组件
        this.player.on('pause', () => {
            this.toggleFloatComponents();
        });

        this.initPlayButton();
        this.initPlayedBar();
        this.initFullButton();
        this.initQualityButton();
        this.initVolumeButton();
    }

    get showing() {
        return !this.player.container.classList.contains('mirror-hide-controller');
    }

    initPlayButton() {
        const { video, template } = this.player;

        template.playIcon &&
            template.playIcon.addEventListener('click', (evt) => {
                evt.stopPropagation();
                const icon = video.paused ? Icons.play : Icons.pause;

                this.switchPlayIcon(icon);
                this.player.__toggle__();
                this.player.bezel.switchPlayIcon(icon);
            });
    }

    switchPlayIcon(icon) {
        this.player.template.playIcon && (this.player.template.playIcon.innerHTML = icon);
    }

    initPlayedBar() {
        // 直播形式不显示进度条
        const playerBar = this.player.template.playerBar;
        if (!playerBar) {
            return;
        }

        const isDomRotated = this.player.isDomRotated;

        const thumbMove = (e) => {
            const axis = isDomRotated() ? 'clientY' : 'clientX';

            let percentage = ((e[axis] || e.changedTouches[0][axis]) - utils.getBoundingClientRectViewLeft(playerBar)) / playerBar.clientWidth;
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            this.player.bar.set('played', percentage, 'width');
            this.player.template.ptime.innerHTML = utils.secondToTime(percentage * this.player.video.duration);
        };

        const thumbUp = (e) => {
            document.removeEventListener(utils.nameMap.dragEnd, thumbUp);
            document.removeEventListener(utils.nameMap.dragMove, thumbMove);

            const axis = isDomRotated() ? 'clientY' : 'clientX';

            let percentage = ((e[axis] || e.changedTouches[0][axis]) - utils.getBoundingClientRectViewLeft(playerBar)) / playerBar.clientWidth;
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            this.player.bar.set('played', percentage, 'width');
            this.player.__seek__(this.player.bar.get('played') * this.player.video.duration);
            this.player.moveBar = false;

            this.player.events.trigger('point', { percentage });
        };

        playerBar.addEventListener(utils.nameMap.dragStart, (e) => {
            e.stopPropagation();

            this.player.moveBar = true;
            document.addEventListener(utils.nameMap.dragMove, thumbMove);
            document.addEventListener(utils.nameMap.dragEnd, thumbUp);
        });

        playerBar.addEventListener(utils.nameMap.dragMove, (e) => {
            e.stopPropagation();

            if (this.player.video.duration) {
                const axis = isDomRotated() ? 'clientY' : 'clientX';

                const px = playerBar.getBoundingClientRect().left;
                const tx = (e[axis] || e.changedTouches[0][axis]) - px;
                if (tx < 0 || tx > playerBar.offsetWidth) {
                    return;
                }
            }
        });
    }

    initFullButton() {
        this.player.template.fullButton.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.player.fullScreen.toggle();
        });
    }

    initVolumeButton() {
        this.player.template.volumeIcon.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.player.muted = undefined; // 直接设置播放器静音状态自动映射到video上
        });
    }

    switchMuteIcon(muted) {
        this.player.template.volumeIcon.innerHTML = !muted ? Icons.volumeOn : Icons.volumeOff;
    }

    setCurrentQuality(index) {
        const { qualityButton, qualityList } = this.player.template;

        const children = qualityList.children;
        if (!children) {
            return;
        }
        Array.from(children).forEach((item, idx) => {
            if (+index === idx) {
                item.classList.add('selected');
                qualityButton.innerText = item.innerText;
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // 显示视频源
    onShowQualityList(evt) {
        evt.stopPropagation();

        this.player.template.qualityMask.classList.remove('hide');
        this.player.template.qualityMask.classList.add('show');
    }

    // 切换视频源
    onSwitchQuality({ target }) {
        if (!target.classList.contains('mirror-quality-item')) {
            return;
        }

        const index = target.dataset.index;
        this.player.__switchQuality__(index);
        this.setCurrentQuality(index);

        this.player.template.qualityMask.classList.remove('show');
    }

    initQualityButton() {
        // 没有多视频源隐藏菜单
        const { qualityMask, qualityButton, qualityList } = this.player.template;
        const quality = this.player.options.src.quality;

        qualityButton.removeEventListener('click', this.onShowQualityList);
        qualityList.removeEventListener('click', this.onShowQualityList);
        if (!quality) {
            qualityButton.classList.add('hide');
            qualityMask.classList.remove('show');
            qualityMask.classList.add('hide');

            return;
        }

        qualityButton.classList.remove('hide');
        qualityMask.classList.remove('hide');

        qualityButton.addEventListener('click', this.onShowQualityList.bind(this));
        qualityList.addEventListener('click', this.onSwitchQuality.bind(this));

        const fregamet = document.createDocumentFragment();
        quality.forEach((item, index) => {
            const dom = document.createElement('div');
            dom.className = 'mirror-quality-item';

            dom.setAttribute('data-index', index);
            dom.innerText = item.label;

            fregamet.append(dom);
        });

        qualityList.innerHTML = '';
        qualityList.appendChild(fregamet);

        this.setCurrentQuality(this.player.qualityIndex);
    }

    // 中止/开启底部控制栏的自动隐藏
    setAutoHide(autoHide = true) {
        this.autoHide = autoHide;
        if (!autoHide) {
            clearTimeout(this.autoHideTimer);
        } else {
            this.setScheduleTask();
        }
    }

    setScheduleTask() {
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = setTimeout(() => {
            const { video, paused, bezel, head } = this.player;
            if (video.played.length && !paused && this.autoHide) {
                this.hide();
                bezel.hide();
                head && head.hide();
            }
        }, 5000);
    }

    toggleFloatComponents() {
        // 播放按钮，暂停状态下都是常显，播放状态下跟随控制条切换
        // 视频播放器操作栏和播放暂停按钮显示控制
        const { head, bezel, paused } = this.player;

        if (this.showing) {
            this.hide();
            head && head.hide();
            clearTimeout(this.autoHideTimer);
        } else {
            this.show();
            head && head.show();

            if (this.autoHide) {
                this.setScheduleTask();
            }
        }

        this.showing || paused ? bezel.show() : bezel.hide();
    }

    show() {
        this.player.container.classList.remove('mirrorhide-controller');
    }

    hide() {
        this.player.container.classList.add('mirrorhide-controller');
    }

    el() {
        return this.player.template.controller;
    }

    destroy() {
        clearTimeout(this.autoHideTimer);
        const { container, bezel } = this.player;

        container.removeEventListener('mousemove', this.toggleFloatComponents.bind(this));
        container.removeEventListener('click', this.toggleFloatComponents.bind(this));
        bezel.destroy();
    }
}

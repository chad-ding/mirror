import utils from './utils';

export const DisplayRule = {
    None: 0, // 不显示
    FullScreen: 1, // 只在全屏显示
    Unlimited: 2 // 无限制
};

export default class {
    showing = false;

    constructor(player) {
        this.player = player;

        this.init();
    }

    init() {
        const { headBackIcon } = this.player.template;

        headBackIcon &&
            headBackIcon.addEventListener('click', () => {
                const fullScreen = this.player.fullScreen;
                /**
                 * 全屏模式下点击箭头取消全屏
                 * 非全屏模式点击触发back
                 */
                if (fullScreen.isFullscreen()) {
                    this.player.fullScreen.cancel();
                } else {
                    history.back();
                }
            });
    }

    show() {
        const { head } = this.player.template;
        if (!head) {
            return;
        }

        const showHead = () => {
            head.classList.add('show');
            this.showing = true;
        };

        // 只在全屏模式下显示
        if (this.player.options.head === 1) {
            const isFullscreen = this.player.fullScreen.isFullscreen();
            isFullscreen && showHead();
            return;
        }

        showHead();
    }

    hide() {
        const { head } = this.player.template;
        if (!head) {
            return;
        }

        head.classList.remove('show');
        this.showing = false;
    }

    toggle() {
        this.showing ? this.hide() : this.show();
    }
}

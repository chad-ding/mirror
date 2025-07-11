// 加载检测
export default class {
    constructor(player) {
        this.player = player;
        this.enabled = false;

        this.detect();
    }

    detect() {
        let lastPlayPos = 0;
        let currentPlayPos = 0;
        let bufferingDetected = false;

        // 检查视频是否在缓冲过程中
        this.loadingChecker = setInterval(() => {
            if (!this.enabled) {
                return;
            }

            currentPlayPos = this.player.video.currentTime;
            if (this.player.video.paused) {
                lastPlayPos = currentPlayPos;
                return;
            }

            if (!bufferingDetected && currentPlayPos === lastPlayPos) {
                this.player.container.classList.add('mirror-loading');
                bufferingDetected = true;

                this.player.events.trigger('waiting', {
                    waiting: true
                });
            } else if (bufferingDetected && currentPlayPos > lastPlayPos) {
                this.player.container.classList.remove('mirrorloading');
                bufferingDetected = false;

                this.player.events.trigger('waiting', {
                    waiting: false
                });
            }
            lastPlayPos = currentPlayPos;
        }, 600);
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    destroy() {
        this.enabled = false;
        clearInterval(this.loadingChecker);
    }
}

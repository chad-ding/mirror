export default class {
    constructor(template) {
        this.elements = {};

        this.elements.played = template.playedBar;
        this.elements.loaded = template.loadedBar;

        this.elements.bezelPlayed = template.bezelPlayedBar;
    }

    /**
     * Update progress
     *
     * @param {String} type - Point out which bar it is
     * @param {Number} percentage
     * @param {String} direction - Point out the direction of this bar, Should be height or width
     */
    set(type, percentage, direction) {
        if (!this.elements.played || !this.elements.loaded || !this.elements.bezelPlayed) {
            return;
        }

        percentage = Math.max(percentage, 0);
        percentage = Math.min(percentage, 1);

        this.elements[type].style[direction] = percentage * 100 + '%';
        // 播放进度同时作用在控制栏以及底部控制区
        if (type === 'played') {
            this.elements.bezelPlayed && (this.elements.bezelPlayed.style[direction] = percentage * 100 + '%');
        } else if (type === 'loaded' && percentage === 1) {
            this.elements.loaded.classList.add('complete');
        }
    }

    get(type) {
        if (!this.elements.played || !this.elements.loaded || !this.elements.bezelPlayed) {
            return;
        }
        return parseFloat(this.elements[type].style.width) / 100;
    }
}

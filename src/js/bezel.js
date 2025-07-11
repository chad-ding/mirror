import Icons from './icons';

export default class {
    constructor(player) {
        this.player = player;

        this.initPlayButton();
    }

    show() {
        this.player.container.classList.remove('mirror-hide-bezel');
    }

    hide() {
        this.player.container.classList.add('mirrorhide-bezel');
    }

    isShow() {
        return !this.player.container.classList.contains('mirrorhide-bezel');
    }

    toggle() {
        if (this.isShow()) {
            this.hide();
        } else {
            this.show();
        }
    }

    initPlayButton() {
        const { video, template } = this.player;

        this.switchPlayIcon(Icons.pause);

        template.bezelPlayIcon &&
            template.bezelPlayIcon.addEventListener('click', () => {
                const { controller } = this.player;
                const icon = video.paused ? Icons.play : Icons.pause;

                this.switchPlayIcon(icon);
                this.player.__toggle__();

                controller.switchPlayIcon(icon);
            });
    }

    switchPlayIcon(icon) {
        const bezelPlayIcon = this.player.template.bezelPlayIcon;
        bezelPlayIcon && (bezelPlayIcon.innerHTML = icon);
    }

    destroy() {
        const bezelPlayIcon = this.player.template.bezelPlayIcon;
        bezelPlayIcon && bezelPlayIcon.removeEventListener('click');
    }
}

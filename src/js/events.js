export default class {
    constructor() {
        this.events = {
            native: [],
            custom: []
        };

        this.nativeEvents = [
            'abort',
            'canplay',
            'canplaythrough',
            'durationchange',
            'emptied',
            'ended',
            'error',
            'loadeddata',
            'loadedmetadata',
            'loadstart',
            'mozaudioavailable',
            'pause',
            'play',
            'playing',
            'progress',
            'ratechange',
            'seeked',
            'seeking',
            'stalled',
            'suspend',
            'timeupdate',
            'volumechange',
            'waiting'
        ];

        this.customEvents = ['ready', 'play', 'pause', 'point', 'sourcechange', 'volumechange', 'fullscreenchange', 'durationchange', 'waiting', 'destroy', 'error'];

        this.init();
    }

    init() {
        this.on(
            'durationchange',
            (evt) =>
                this.trigger('durationchange', {
                    duration: evt.target.duration
                }),
            true
        );

        this.on('play', () => this.trigger('play'), true);
        this.on('pause', () => this.trigger('pause'), true);

        this.on('volumechange', (evt) => this.trigger('volumechange', { muted: evt.target.muted, volume: evt.target.volume }), true);
    }

    on(name, callback, native = false) {
        if (typeof callback !== 'function') {
            console.error('事件回调必须是一个函数');
            return;
        }

        const eventType = native ? 'native' : 'custom';
        if (!this.events[eventType][name]) {
            this.events[eventType][name] = [];
        }
        this.events[eventType][name].push(callback);
    }

    off(name, callback, native = false) {
        const eventType = native ? 'native' : 'custom';

        if (!callback) {
            this.events[eventType][name] = [];
            return;
        }

        const index = this.events[eventType][name].indexOf(callback);
        if (index !== -1) {
            this.events[eventType][name].splice(index, 1);
        }
    }

    trigger(name, detail, native = false) {
        const eventType = native ? 'native' : 'custom';
        const events = this.events[eventType][name] || [];

        for (let i = 0; i < events.length; i++) {
            events[i](detail);
        }
    }
}

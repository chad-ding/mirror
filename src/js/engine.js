import utils from './utils';
import mixinOptions from './options';
import { i18n } from './i18n';
import Template from './template';
import Events from './events';
import FullScreen from './fullscreen';
import Bar from './bar';
import Head from './head';
import Bezel from './bezel';
import LoadingDetect from './loading-detect';
import Controller from './controller';
import Icons from './icons';

import tplVideo from '../template/video.art';

let index = 0; // 当前页面播放器实例索引
const instances = [];

export default class {
    qualityIndex = -1; // 多视频源场景当前视频索引
    played = false; // 非首次播放
    playTime = Date.now(); // 开始播放时间戳
    paused = true; // 视屏暂停状态

    constructor(container, options) {
        if (!container) {
            console.error('container不能为空');
            return;
        }
        console.info('初始化播放器');
        this.container = container;

        // 合并混入默认配置
        this.options = mixinOptions({
            pluginOptions: {},
            preload: options.src && options.src.type === 'webtorrent' ? 'none' : 'metadata',
            ...options
        });

        if (this.options.src.quality) {
            this.qualityIndex = this.options.src.defaultQuality || 0;
        }
        this.tran = new i18n(this.options.lang).tran;
        this.events = new Events();

        this.container.classList.add('mirror');

        if (this.options.live) {
            this.container.classList.add('mirror-live');
        } else {
            this.container.classList.remove('mirror-live');
        }

        this.template = new Template(this.container, {
            options: this.options,
            index,
            tran: this.tran
        });

        this.template.errorBtn.addEventListener('click', () => {
            this.template.errorPanel.classList.remove('show');
            this.__play__();
        });

        this.video = this.template.video;
        this.bar = new Bar(this.template);
        this.fullScreen = new FullScreen(this);
        this.controller = new Controller(this);
        this.bezel = new Bezel(this);
        if (options.head !== 0) {
            this.head = new Head(this);
        }

        this.plugins = {};
        this.docClickFun = () => {
            this.focus = false;
        };
        this.containerClickFun = () => {
            this.focus = true;
        };
        document.addEventListener('click', this.docClickFun, true);
        this.container.addEventListener('click', this.containerClickFun, true);

        this.paused = true;
        this.loadingDetect = new LoadingDetect(this);

        let quality;
        if (this.qualityIndex !== -1) {
            quality = this.options.src.quality[this.qualityIndex];
        }

        this.__initVideo__(this.video, (quality && quality.type) || this.options.src.type);

        // 自动播放
        if (this.options.autoplay) {
            this.$on('canplay', () => {
                this.__play__();
            });
        }

        this.moveBar = false;

        index++;
        instances.push(this);
    }

    /**
     * Play video
     */
    __play__(fromNative) {
        console.info('播放视频: ', fromNative);

        this.paused = false;

        if (!fromNative) {
            const playedPromise = Promise.resolve(this.video.play());
            playedPromise
                .catch((err) => {
                    console.error('视频播放错误: ', err, '链接:', this.video.src);
                    this.events.trigger('error', {
                        code: err.code,
                        msg: err.message
                    });

                    this.template.errorPanel.classList.add('show');
                    this.__pause__();
                })
                .finally(() => (this.played = true));
        }

        this.loadingDetect.enable();
        this.container.classList.remove('mirror-paused');
        this.container.classList.add('mirror-playing');

        if (this.options.mutex) {
            for (let i = 0; i < instances.length; i++) {
                if (this !== instances[i]) {
                    instances[i].__pause__();
                }
            }
        }

        this.controller.switchPlayIcon(Icons.play);
        this.bezel.switchPlayIcon(Icons.play);
    }

    /**
     * Pause video
     */
    __pause__(fromNative, ended) {
        console.info('暂停视频播放: ', fromNative, ended);

        this.paused = true;
        this.container.classList.remove('mirror-loading');

        if (!fromNative) {
            setTimeout(() => {
                this.video.pause();
            }, 150);
        }
        this.loadingDetect.disable();
        this.container.classList.remove('mirror-playing');
        this.container.classList.add('mirror-paused');

        // 直播没有重播功能
        this.controller.switchPlayIcon(ended && !this.options.live ? Icons.replay : Icons.pause);
        this.bezel.switchPlayIcon(ended && !this.options.live ? Icons.replay : Icons.pause);
    }

    /**
     * Seek video
     */
    __seek__(time) {
        if (isNaN(time)) {
            return;
        }
        time = Math.max(time, 0);
        if (this.video.duration) {
            time = Math.min(time, this.video.duration);
        }

        this.video.currentTime = time;

        // 直播没有进度条
        if (!this.options.live) {
            this.bar.set('played', time / this.video.duration, 'width');
            this.template.ptime.innerHTML = utils.secondToTime(time);
        }
    }

    /**
     * Toggle between play and pause
     */
    __toggle__() {
        if (this.video.paused) {
            this.__play__();
        } else {
            this.__pause__();
        }
    }

    // 加载解码器
    __loadDecoder__(type, callback) {
        console.log('加载解码器: ', type);
        const source = {
            hls: '//cdn.jsdelivr.net/npm/hls.js@1.6.5/dist/hls.min.js',
            flv: '//cdn.jsdelivr.net/npm/flv.js@1.6.2/dist/flv.min.js',
            dash: '//cdn.jsdelivr.net/npm/dashjs@5.0.3/dist/legacy/umd/dash.all.min.js',
            webtorrent: '//cdn.jsdelivr.net/npm/webtorrent@2.6.8/dist/webtorrent.min.js'
        };

        const ele = document.createElement('script');
        ele.type = 'text/javascript';
        ele.src = source[type];
        ele.onload = () => {
            console.log('解码器加载成功');
            callback();
        };
        ele.onerror = () => {
            console.error('解码器加载失败');
        };

        document.head.appendChild(ele);
    }

    __initMSE__(video, type) {
        this.type = type;

        if (this.options.src.customType && this.options.src.customType[type]) {
            if (Object.prototype.toString.call(this.options.src.customType[type]) === '[object Function]') {
                this.options.src.customType[type](this.video, this);
            } else {
                console.error(`无效的自定义视频类型: ${type}`);
            }

            setTimeout(() => this.events.trigger('ready', { index }));
        } else {
            if (this.type === 'auto') {
                if (/\.m3u8(#|\?|$)/i.exec(video.src)) {
                    this.type = 'hls';
                } else if (/\.flv(#|\?|$)/i.exec(video.src)) {
                    this.type = 'flv';
                } else if (/\.mpd(#|\?|$)/i.exec(video.src)) {
                    this.type = 'dash';
                } else {
                    this.type = 'normal';
                }
            }

            // 检查安卓设备是否原生支持了hls格式
            if (this.type === 'hls' && (video.canPlayType('application/x-mpegURL') || video.canPlayType('application/vnd.apple.mpegURL'))) {
                this.type = 'normal';
            }

            let handler;
            console.log('视屏类型: ', this.type);
            switch (this.type) {
                // https://github.com/video-dev/hls.js
                case 'hls':
                    handler = () => {
                        if (window.Hls.isSupported()) {
                            const options = this.options.pluginOptions.hls;
                            const hls = new window.Hls(options);
                            this.plugins.hls = hls;
                            hls.loadSource(video.src);
                            hls.attachMedia(video);
                            this.events.on('destroy', () => {
                                hls.destroy();
                                delete this.plugins.hls;
                            });
                        }
                        setTimeout(() => this.events.trigger('ready', { index }));
                    };

                    if (window.Hls) {
                        handler();
                    } else {
                        this.__loadDecoder__(this.type, handler);
                    }
                    break;

                // https://github.com/Bilibili/flv.js
                case 'flv':
                    handler = () => {
                        if (window.flvjs.isSupported()) {
                            const flvPlayer = window.flvjs.createPlayer(
                                Object.assign(this.options.pluginOptions.flv.mediaDataSource || {}, {
                                    type: 'flv',
                                    url: video.src
                                }),
                                this.options.pluginOptions.flv.config
                            );
                            this.plugins.flvjs = flvPlayer;
                            flvPlayer.attachMediaElement(video);
                            flvPlayer.load();
                            this.events.on('destroy', () => {
                                flvPlayer.unload();
                                flvPlayer.detachMediaElement();
                                flvPlayer.destroy();
                                delete this.plugins.flvjs;
                            });
                        }
                        setTimeout(() => this.events.trigger('ready', { index }));
                    };

                    if (window.flvjs) {
                        handler();
                    } else {
                        this.__loadDecoder__(this.type, handler);
                    }
                    break;

                // https://github.com/Dash-Industry-Forum/dash.js
                case 'dash':
                    handler = () => {
                        if (window.dashjs) {
                            const dashjsPlayer = window.dashjs.MediaPlayer().create().initialize(video, video.src, false);
                            const options = this.options.pluginOptions.dash;
                            dashjsPlayer.updateSettings(options);
                            this.plugins.dash = dashjsPlayer;
                            this.events.on('destroy', () => {
                                window.dashjs.MediaPlayer().reset();
                                delete this.plugins.dash;
                            });
                        }
                        setTimeout(() => this.events.trigger('ready', { index }));
                    };
                    if (window.dashjs) {
                        handler();
                    } else {
                        this.__loadDecoder__(this.type, handler);
                    }
                    break;

                // https://github.com/webtorrent/webtorrent
                case 'webtorrent':
                    handler = () => {
                        if (window.WebTorrent) {
                            if (window.WebTorrent.WEBRTC_SUPPORT) {
                                this.container.classList.add('mirror-loading');
                                const options = this.options.pluginOptions.webtorrent;
                                const client = new window.WebTorrent(options);
                                this.plugins.webtorrent = client;
                                const torrentId = video.src;
                                video.src = '';
                                video.preload = 'metadata';
                                video.addEventListener('durationchange', () => this.container.classList.remove('mirror-loading'), { once: true });
                                client.add(torrentId, (torrent) => {
                                    const file = torrent.files.find((file) => file.name.endsWith('.mp4'));
                                    file.renderTo(this.video, {
                                        autoplay: this.options.autoplay,
                                        controls: false
                                    });
                                });
                                this.events.on('destroy', () => {
                                    client.remove(torrentId);
                                    client.destroy();
                                    delete this.plugins.webtorrent;
                                });
                            }
                        }

                        setTimeout(() => this.events.trigger('ready', { index }));
                    };

                    if (window.WebTorrent) {
                        handler();
                    } else {
                        this.__loadDecoder__(this.type, handler);
                    }
                    break;
                default:
                    setTimeout(() => this.events.trigger('ready', { index }));
            }
        }
    }

    __initVideo__(video, type) {
        this.__initMSE__(video, type);

        // 非直播更新播放进度
        if (!this.options.live) {
            this.$on('durationchange', () => {
                if (video.duration !== 1 && video.duration !== Infinity) {
                    this.template.dtime.innerHTML =
                        this.options.durationFormat === 'total' ? utils.secondToTime(video.duration) : utils.secondToTime(video.duration - video.currentTime);
                }
            });

            this.$on('timeupdate', () => {
                const { currentTime: played, duration } = this.video;
                if (!this.moveBar) {
                    this.bar.set('played', played / duration, 'width');
                }
                const currentTime = utils.secondToTime(played);
                if (this.template.ptime.innerHTML !== currentTime) {
                    this.template.ptime.innerHTML = currentTime;
                    this.template.dtime.innerHTML = this.options.durationFormat === 'total' ? utils.secondToTime(duration) : utils.secondToTime(duration - played);
                }
            });
        }

        // show video loaded bar: to inform interested parties of progress downloading the media
        this.$on('progress', () => {
            const percentage = video.buffered.length ? video.buffered.end(video.buffered.length - 1) / video.duration : 0;
            this.bar.set('loaded', percentage, 'width');
        });

        // video download error: an error occurs
        this.$on('error', () => {
            if (!this.video.error) {
                return;
            }

            this.played = true;
        });

        // video end
        this.$on('ended', () => {
            this.bar.set('played', 1, 'width');
            if (!this.options.loop) {
                this.__pause__(false, true);
            } else {
                this.__seek__(0);
                this.__play__();
            }
        });

        this.$on('play', () => {
            this.playTime = Date.now();

            this.bezel.hide();
            this.template.errorPanel.classList.remove('show');

            if (this.paused) {
                this.__play__(true);
            }
        });

        this.$on('pause', () => {
            if (!this.paused) {
                this.__pause__(true);
            }
        });

        // 绑定所有原生事件
        for (let i = 0; i < this.events.nativeEvents.length; i++) {
            video.addEventListener(this.events.nativeEvents[i], (e) => {
                this.events.trigger(this.events.nativeEvents[i], e, true);
            });
        }

        this.muted = this.options.muted;
        this.controller.switchMuteIcon(this.options.muted);
    }

    __switchQuality__(index) {
        index = typeof index === 'string' ? parseInt(index) : index;
        if (this.qualityIndex === index || this.switchingQuality) {
            return;
        } else {
            this.prevIndex = this.qualityIndex;
            this.qualityIndex = index;
        }
        this.switchingQuality = true;

        const quality = this.options.src.quality[index];
        this.template.qualityButton.innerHTML = quality.label;

        const paused = this.video.paused;

        const videoHTML = tplVideo({
            current: false,
            poster: null,
            preload: 'auto',
            url: quality.url,
            id: `video_${Date.now()}`
        });
        const videoEle = new DOMParser().parseFromString(videoHTML, 'text/html').body.firstChild;
        this.template.videoWrap.insertBefore(videoEle, this.template.videoWrap.getElementsByTagName('div')[0]);

        this.prevVideo = this.video;
        this.video = videoEle;

        setTimeout(() => {
            this.prevVideo && this.prevVideo.pause();
        }, 150);

        this.__initVideo__(this.video, quality.type || this.options.src.type);
        if (!this.options.live) {
            this.__seek__(this.prevVideo.currentTime);
        }

        if (!paused) {
            setTimeout(() => {
                this.video.play();
            }, 150);
        }

        this.events.trigger('sourcechange', {
            qualityIndex: this.qualityIndex
        });

        this.$on('canplay', () => {
            if (!this.prevVideo) {
                return;
            }

            if (!this.options.live && this.video.currentTime !== this.prevVideo.currentTime) {
                this.__seek__(this.prevVideo.currentTime);
                return;
            }
            this.template.videoWrap.removeChild(this.prevVideo);
            this.video.classList.add('mirror-video-current');
            if (!paused) {
                setTimeout(() => {
                    this.video.play();
                }, 150);
            }
            this.prevVideo = undefined;
            this.switchingQuality = false;

            this.events.trigger('quality_end');
        });

        this.$on('error', () => {
            if (!this.video.error || !this.prevVideo) {
                return;
            }

            this.template.videoWrap.removeChild(this.video);
            this.video = this.prevVideo;
            if (!paused) {
                setTimeout(() => {
                    this.video.play();
                }, 150);
            }
            this.qualityIndex = this.prevIndex;
            this.controller.setCurrentQuality(this.qualityIndex);

            this.prevVideo = undefined;
            this.switchingQuality = false;
        });
    }
}

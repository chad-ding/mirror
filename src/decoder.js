// 解码器
export default class {
    type = 'normal'
    decoderOptions = {}
    video = undefined
    decoder = undefined

    constructor(video, type, playerOptions, decoderOptions) {
        this.vidoe = video
        this.type = type
        this.decoderOptions = decoderOptions
        this.playerOptions = playerOptions

        this.boot(video, type, playerOptions, decoderOptions)
    }

    destroy() {
        if (this.type === 'flv') {
            this.decoder.unload()
            this.decoder.detachMediaElement()
            this.decoder.destroy()
        } else if (this.type === 'dash') {
            window.dashjs.MediaPlayer().reset()
        } else if (this.type === 'webtorrent') {
            this.decoder.remove(torrentId)
            this.decoder.destroy()
        }

        delete this.decoder
    }

    boot(video, type, playerOptions = {}, decoderOptions = {}) {
        console.log('视屏类型: ', type)

        // 已经原生支持hls类型
        if (
            type === 'hls' &&
            (video.canPlayType('application/x-mpegURL') || video.canPlayType('application/vnd.apple.mpegURL'))
        ) {
            console.log('浏览器原生支持HLS格式视频')
            return
        }

        if (!['hls', 'flv', 'dash', 'webtorrent'].includes(type)) {
            console.log('不支持的视频类型')
            return
        }

        // 加载外置解码器
        const loadDecoder = (type, callback) => {
            const source = {
                hls: '//cdn.jsdelivr.net/npm/hls.js@1.6.5/dist/hls.min.js',
                flv: '//cdn.jsdelivr.net/npm/flv.js@1.6.2/dist/flv.min.js',
                dash: '//cdn.jsdelivr.net/npm/dashjs@5.0.3/dist/legacy/umd/dash.all.min.js',
                webtorrent: '//cdn.jsdelivr.net/npm/webtorrent@2.6.8/dist/webtorrent.min.js'
            }

            const ele = document.createElement('script')
            ele.type = 'text/javascript'
            ele.src = source[type]
            ele.onload = callback
            ele.onerror = () => {
                console.error('加载视频解码器失败: ', type)
            }

            document.head.appendChild(ele)
        }

        let handler
        switch (type) {
            case 'hls':
                handler = () => {
                    if (!window.Hls.isSupported()) {
                        return
                    }

                    this.decoder = new window.Hls(decoderOptions)
                    this.decoder.loadSource(video.src)
                    this.decoder.attachMedia(video)
                }

                if (window.Hls) {
                    handler()
                } else {
                    loadDecoder(type, handler)
                }
                break
            case 'flv':
                handler = () => {
                    if (!window.flvjs.isSupported()) {
                        return
                    }

                    this.decoder = window.flvjs.createPlayer(
                        Object.assign(decoderOptions.mediaDataSource || {}, {
                            type: 'flv',
                            url: video.src
                        }),
                        decoderOptions.config
                    )
                    this.decoder.attachMediaElement(video)
                    this.decoder.load()
                }

                if (window.flvjs) {
                    handler()
                } else {
                    loadDecoder(this.type, handler)
                }
                break

            case 'dash':
                handler = () => {
                    if (!window.dashjs) {
                        return
                    }

                    this.decoder = window.dashjs.MediaPlayer().create().initialize(video, video.src, false)
                    this.decoder.updateSettings(decoderOptions)
                }
                if (window.dashjs) {
                    handler()
                } else {
                    loadDecoder(this.type, handler)
                }
                break

            case 'webtorrent':
                handler = () => {
                    if (!window.WebTorrent || !window.WebTorrent.WEBRTC_SUPPORT) {
                        return
                    }

                    this.decoder = new window.WebTorrent(decoderOptions)
                    const torrentId = video.src
                    video.src = ''
                    video.preload = 'metadata'

                    this.decoder.add(torrentId, (torrent) => {
                        const file = torrent.files.find((file) => file.name.endsWith('.mp4'))
                        file.renderTo(video, {
                            autoplay: playerOptions.autoplay,
                            controls: false
                        })
                    })
                }

                if (window.WebTorrent) {
                    handler()
                } else {
                    loadDecoder(this.type, handler)
                }
                break
        }
    }
}

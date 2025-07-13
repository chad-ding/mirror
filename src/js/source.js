// 检查视频类型
export default (src, type) => {
    // H5视频播放器支持常规视频类型mp4/WebM/Ogg
    if (type === 'normal' || (type && type !== 'auto')) {
        return type;
    }

    if (/\.m3u8(#|\?|$)/i.exec(src)) {
        return 'hls';
    } else if (/\.flv(#|\?|$)/i.exec(src)) {
        return 'flv';
    } else if (/\.mpd(#|\?|$)/i.exec(src)) {
        return 'dash';
    } else {
        return 'normal';
    }
};

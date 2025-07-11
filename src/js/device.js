const androidVersion = (() => {
    const matches = /Android ([\.|\d]+);/.exec(navigator.userAgent);
    if (matches === null) {
        return Number.MAX_SAFE_INTEGER;
    }

    const str = matches[1];
    return str.substring(0, str.indexOf('.') === -1 ? str.length : str.indexOf('.'));
})();

export default {
    androidVersion: Number(androidVersion) || 'unknown' // 安卓版本
};

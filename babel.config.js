module.exports = function (api) {
    api.cache(true);

    return {
        sourceType: 'module',
        presets: [
            [
                '@babel/preset-env',
                {
                    useBuiltIns: 'usage',
                    modules: false,
                    corejs: 3
                }
            ]
        ]
    };
};

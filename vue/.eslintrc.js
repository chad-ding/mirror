module.exports = {
	root: true,
	extends: ['./.eslint-config.js'],
	ignorePatterns: ['*.html'],
	rules: {
		'no-new-func': 'off',
		'no-prototype-builtins': 'off',
		'vue/multi-word-component-names': 'off'
	}
}

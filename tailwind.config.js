const plugin = require('tailwindcss/plugin');

function variantGroup({ postcss, variants }) {
	// console.log({
	// 	atRule: postcss.atRule({
	// 		name: 'mediaxxxxxxxx',
	// 		params: '(prefers-reduced-motion: no-preference)'
	// 	}),
	// 	root: postcss.root(),
	// 	variants
	// });
}
const variantGroupPlugin = plugin(variantGroup);

module.exports = {
	// uncomment this to enable Just-in-Time mode
	// https://tailwindcss.com/docs/just-in-time-mode#enabling-jit-mode
	// mode: "jit",
	theme: {
		extend: {}
	},
	dark: 'class',
	// corePlugins: [ 'margin', 'ringWidth', 'backgroundColor' ],
	variants: {},
	plugins: [ variantGroupPlugin, require('@downwindcss/flex-center') ],
	purge: [ './public/index.html' ]
};

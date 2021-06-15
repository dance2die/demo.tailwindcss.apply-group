const postcss = require('postcss');
const XRegExp = require('xregexp');
const tailwindcss = require('tailwindcss');

function hasAtRule(css, atRule, condition) {
	let found = false;

	css.walkAtRules(
		atRule,
		condition === undefined
			? () => {
					found = true;
					return false;
				}
			: (node) => {
					if (condition(node)) {
						found = true;
						return false;
					}
				}
	);

	return found;
}

const newline = /\r?\n|\r|\t/gim;
// const start = '(\\S[^:\\(]+):\\(';
// const start = '\\S+:\\(';
// https://stackoverflow.com/a/449000/4035
const start = '(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)+:\\(';
const end = '\\)';
const flags = 'gimu';
const valueNames = [ 'between', 'variant', 'inside-variant' ];

const matcher = (text) =>
	XRegExp.matchRecursive(text.replace(newline, ' '), start, end, flags, {
		valueNames
	});

// variant with ":"
function build(text, result = [], variant = '') {
	const matches = matcher(text);
	if (variant === '' && matches.length === 1) {
		result.push(matches[0].value);
		return;
	}

	// console.log({ ______matches: matches });

	let currentVariant = variant;
	matches.map(({ name, value }) => {
		if (name === 'between') {
			result.push(...value.split(' ').filter(Boolean).map((utility) => `${variant}${utility}`));
		} else if (name === 'variant') {
			// remove '(' from 'md:('
			currentVariant = currentVariant + value.substring(0, value.length - 1);
		} else if (name === 'inside-variant') {
			build(value, result, currentVariant);
			// restore variant
			currentVariant = variant;
		}
	});
}

function processCSS(css, result) {
	css.walkAtRules('apply-group', (atRule) => {
		const built = [];
		// console.log('----BEFORE', { atRule });

		atRule.name = 'apply';
		build(atRule.params, built);
		atRule.params = built.join(' ');

		// rule.params = 'text-xl bg-red-700 text-yellow-200';
		// rule.name = 'apply';
		console.log('----AFTER', { atRule: atRule.params });
	});

	// console.log({ result });
	// console.log('===========>', { css: css.nodes.toString(), result });
}

function variantGroupsPlugin(css, result) {
	if (!hasAtRule(css, 'apply-group')) {
		return css;
	}
	// console.log({ css, css2: JSON.stringify(css.nodes, null, 2), result });

	// return css;

	return postcss([ processCSS ]).process(css, { from: __filename });
}

module.exports = postcss.plugin('variantGroups', (config) => {
	return postcss([ variantGroupsPlugin ]).process();
});

// // Migration: https://evilmartians.com/chronicles/postcss-8-plugin-migration
// module.exports = (opts = {}) => {
// 	return {
// 		postcssPlugin: 'variantGroups',

// 		prepare(result) {
// 			const built = [];
// 			console.log('initial result..........', { result, __filename });

// 			return {
// 				AtRule: {
// 					'apply-group': (atRule) => {
// 						// Let Tailwind process `@apply` rule with normalized groups
// 						atRule.name = 'apply';
// 						build(atRule.params, built);
// 						atRule.params = built.join(' ');

// 						console.log(':::::::::after --->', { atRule });
// 						// result.processor.process(atRule.params);
// 						// postcss([ tailwindcss ]).process(atRule.params);
// 					},
// 					apply: (atRule) => {
// 						atRule.params = built.join(' ');
// 						console.log(':::::::::APPPPPPLLLLLY --->', { atRule, css: atRule.parent.nodes.toString() });
// 					}
// 				},
// 				AtRuleExit: {
// 					apply: (atRule) => {
// 						console.log({ ':::::::::atRuleExit........': atRule, result });
// 					}
// 				}
// 			};
// 		}
// 	};
// };

module.exports.postcss = true;

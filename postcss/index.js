// const postcss = require('postcss');
const XRegExp = require('xregexp');

// function hasAtRule(css, atRule, condition) {
// 	let found = false;

// 	css.walkAtRules(
// 		atRule,
// 		condition === undefined
// 			? () => {
// 					found = true;
// 					return false;
// 				}
// 			: (node) => {
// 					if (condition(node)) {
// 						found = true;
// 						return false;
// 					}
// 				}
// 	);

// 	return found;
// }

// function processCSS(css, result) {
// 	css.walkAtRules('apply-group', (rule) => {
// 		console.log('----BEFORE', { rule });
// 		rule.params = 'text-xl bg-red-700 text-yellow-200';
// 		rule.name = 'apply';
// 		console.log('----AFTER', { rule });
// 	});

// 	console.log({ result });

// 	console.log('===========>', { css: css.nodes.toString(), result });
// }

// function variantGroupsPlugin(css, result) {
// 	// if (!hasAtRule(css, 'apply-group')) {
// 	// 	return css;
// 	// }
// 	// console.log({ css, css2: JSON.stringify(css.nodes, null, 2), result });

// 	// return css;

// 	return postcss([ processCSS ]).process(css, { from: __filename });
// }

// module.exports = postcss.plugin('variantGroups', (config) => {
// 	return postcss([ variantGroupsPlugin ]).process();
// });

const newline = /\r?\n|\r|\t/gim;
const start = '\\S+:\\(';
const end = '\\)';
const flags = 'gim';
const valueNames = [ 'between', 'variant', 'inside-variant' ];

const matcher = (text) => {
	console.log({ matcherText: text });
	return XRegExp.matchRecursive(text.replace(newline, ' '), start, end, flags, {
		valueNames
	});
};

// variant with ":"
function build(text, result = [], variant = '') {
	const matches = matcher(text);
	if (variant === '' && matches.length === 1) {
		result.push(matches[0].value);
		return;
	}

	// console.info({ ______matches: matches });

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

// Migration: https://evilmartians.com/chronicles/postcss-8-plugin-migration
module.exports = (opts = {}) => {
	return {
		postcssPlugin: 'variantGroups',
		// Once(root, rest) {
		// 	console.log({ root, rest });
		// 	return postcss([ variantGroupsPlugin ]).process();
		// }
		AtRule: {
			'apply-group': (atRule) => {
				const built = [];
				// console.log('before --->', { atRule, built });
				build(atRule.params, built);
				atRule.params = built.join(' ');
				// Let Tailwind process `@apply` rule with normalized groups
				atRule.name = 'apply';
				console.log('after --->', { atRule });
			}
		}
	};
};

module.exports.postcss = true;

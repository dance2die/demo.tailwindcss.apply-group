const postcss = require('postcss');

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

function processCSS(css, result) {
	css.walkAtRules('apply-group', (rule) => {
		console.log('----BEFORE', { rule });
		rule.params = 'text-xl bg-red-700 text-yellow-200';
		rule.name = 'apply';
		console.log('----AFTER', { rule });
	});

	console.log({ result });

	console.log('===========>', { css: css.nodes.toString(), result });
}

function variantGroupsPlugin(css, result) {
	// if (!hasAtRule(css, 'apply-group')) {
	// 	return css;
	// }
	// console.log({ css, css2: JSON.stringify(css.nodes, null, 2), result });

	// return css;

	return postcss([ processCSS ]).process(css, { from: __filename });
}

module.exports = postcss.plugin('variantGroups', (config) => {
	return postcss([ variantGroupsPlugin ]).process();
});

// module.exports = (opts = {}) => {
// 	return {
// 		postcssPlugin: 'variantGroups',
// 		Once(root, rest) {
// 			// console.log({ root, rest });
// 			return postcss([ variantGroupsPlugin ]);
// 		}
// 	};
// };

// module.exports = (opts = {}) => {
// 	// Work with options here

// 	return {
// 		postcssPlugin: 'tailwindcssvariantgroup'

// 		// Root(root, postcss) {
// 		// 	// Transform CSS AST here
// 		// 	console.log('ROOOOOOOOOOT', root.toString());
// 		// },
// 		// AtRule(atRule) {
// 		// 	console.log('--------->>>', atRule.params.toString());
// 		// }

// 		// Rule(rule) {
// 		// 	console.log(rule.toString());
// 		// },
// 		// Declaration(decl) {
// 		// 	console.log(decl.toString());
// 		// }

// 		/*
//     Declaration: {
//       color: (decl, postcss) {
//         // The fastest way find Declaration node if you know property name
//       }
//     }
//     */
// 	};
// };
module.exports.postcss = true;

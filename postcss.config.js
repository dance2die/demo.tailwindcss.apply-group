const tailwindcssvariantgroup = require('./postcss');

module.exports = {
	plugins: [ require('./postcss'), require('tailwindcss'), require('autoprefixer') ]
};

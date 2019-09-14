const mode = process.env.NODE_ENV || 'production';
const dev = mode === 'development';

const purgecss = require('@fullhuman/postcss-purgecss')({
    // Specify the paths to all of the template files in your project
    content: ['./src/**/*.html', './src/**/*.svelte', './src/**/*.css'],
  
    // Include any special characters you're using in this regular expression
    defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
});

module.exports = {
    plugins: [
        require('postcss-import'),
        require('tailwindcss'),
        require('autoprefixer'),
        require('postcss-fail-on-warn'),
        // Do not purge the CSS in dev mode to be able to play with classes in the browser dev-tools.
        !dev && purgecss,
        !dev && require('cssnano')({
            preset: 'default'
        })
    ]
};

module.exports = {
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module',
    },
    rules: {
        semi: ['error', 'always']
    },
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        }
    },
    env: {
        es6: true,
        browser: true,
        node: true
    }
};

import tsParser from '@typescript-eslint/parser'
import mochaPlugin from 'eslint-plugin-mocha'
import chaiFriendlyPlugin from 'eslint-plugin-chai-friendly'
import sonarjsPlugin from 'eslint-plugin-sonarjs'

export default [
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 8,
                ecmaFeatures: {
                    jsx: true,
                    modules: true,
                },
                sourceType: 'module',
            },
        },
        plugins: {
            mocha: mochaPlugin,
            'chai-friendly': chaiFriendlyPlugin,
            sonarjs: sonarjsPlugin,
        },
        rules: {
            'mocha/no-exclusive-tests': 'error',
            'sonarjs/todo-tag': 'off',
            'sonarjs/no-skipped-tests': 'off',
            'sonarjs/public-static-readonly': 'off',
            'sonarjs/no-ignored-exceptions': 'off',
            'sonarjs/pseudo-random': 'off',
            'sonarjs/no-nested-functions': 'off',
            'sonarjs/no-nested-template-literals': 'off',
            'sonarjs/cognitive-complexity': 'off',
        },
    },
]

import { defineConfig } from 'eslint/config'
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPrettier from 'eslint-plugin-prettier'
import importSort from 'eslint-plugin-simple-import-sort'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import { join } from 'node:path'

/** 忽略的文件 */
const ignores = ['node_modules/**', '**/dist/**']

/** 基础配置 */
/** @type {import('eslint/config').Config} */
const baseConfig = {
    files: ['**/*.{js,jsx,ts,tsx,vue}'],
    plugins: {
        prettier: eslintPrettier,
        'simple-import-sort': importSort,
    },
    rules: {},
}

/** Vue 配置 */
/** @type {import('eslint/config').Config} */
const vueConfig = {
    files: [
        'apps/web/**/*.{ts,tsx,vue}',
        'apps/admin/**/*.{ts,tsx,vue}',
        'packages/ui/**/*.{ts,tsx,vue}',
        'playground/demo/**/*.{ts,tsx,vue}',
    ],
    plugins: {
        vue,
    },
    languageOptions: {
        globals: {
            ...globals.browser,
        },
        parser: vueParser,
        parserOptions: {
            parser: tseslint.parser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            extraFileExtensions: ['.vue'],
        },
    },
    rules: {
        ...vue.configs['flat/recommended'].reduce((acc, config) => ({ ...acc, ...config.rules }), {}),
        'no-console': 'error',
        'vue/block-order': [
            'error',
            {
                order: [['script', 'template'], 'style'],
            },
        ],
        'vue/component-name-in-template-casing': [
            'error',
            'PascalCase',
            {
                registeredComponentsOnly: false,
            },
        ],
        'vue/multi-word-component-names': 'off',
        "vue/max-attributes-per-line": "off",
        
    },
}

/** server 配置 */
/** @type {import('eslint/config').Config} */
const serverConfig = {
    files: ['apps/server/**/*.{js,ts}'],
    languageOptions: {
        globals: {
            ...globals.node,
        },
        sourceType: 'commonjs',
        parserOptions: {
            projectService: true,
            tsconfigRootDir: join(import.meta.dirname, 'apps/server'),
        },
    },
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
    },
}

export default defineConfig(
    { ignores },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    ...vue.configs['flat/recommended'],
    [baseConfig, vueConfig, serverConfig]
)

import { defineConfig } from 'eslint/config'
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPrettier from 'eslint-plugin-prettier'
import importSort from 'eslint-plugin-simple-import-sort'
import { join } from 'node:path'

/** 忽略的文件 */
const ignores = ['node_modules/**', '**/dist/**']

/** 基础配置 */
/** @type {import('eslint/config').Config} */
const baseConfig = {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
        prettier: eslintPrettier,
        'simple-import-sort': importSort,
    },
    rules: {
        'no-console': 'off',
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

export default defineConfig({ ignores }, eslint.configs.recommended, tseslint.configs.recommended, [baseConfig, serverConfig])

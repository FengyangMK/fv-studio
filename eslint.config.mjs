import { defineConfig } from 'eslint/config'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPrettier from 'eslint-plugin-prettier'
import importSort from 'eslint-plugin-simple-import-sort'

/** 忽略的文件 */
const ignores = []

/** 基础配置 */
/** @type {import('eslint/config').Config} */
const baseConfig = {
    plugins: {
        prettier: eslintPrettier,
        'simple-import-sort': importSort,
    },
    rules: {
        'no-console': 'error',
    },
}

export default defineConfig({ ignores }, eslint.configs.recommended, tseslint.configs.recommended, [baseConfig])

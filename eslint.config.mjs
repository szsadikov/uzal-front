import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import jestPlugin from 'eslint-plugin-jest'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import eslintPrettier from 'eslint-plugin-prettier'
import eslintReact from 'eslint-plugin-react'
import eslintReactHooks from 'eslint-plugin-react-hooks'
import eslintReactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import testingLibraryPlugin from 'eslint-plugin-testing-library'
import globals from 'globals'
import tsEslint from 'typescript-eslint'

export default tsEslint.config(
	js.configs.recommended,
	...tsEslint.configs.recommended,

	{
		extends: [js.configs.recommended, ...tsEslint.configs.recommended],
		files: ['**/*.{ts,tsx}']
	},

	{
		plugins: {
			'@typescript-eslint': tsEslint.plugin,
			'jsx-a11y': jsxA11yPlugin,
			'react-hooks': eslintReactHooks,
			'react-refresh': eslintReactRefresh,
			'simple-import-sort': simpleImportSort,
			'testing-library': testingLibraryPlugin,
			import: importPlugin,
			jest: jestPlugin,
			jsdoc: jsdocPlugin,
			prettier: eslintPrettier,
			react: eslintReact
		}
	},

	{
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.node,
				...globals.browser,
				...globals.es2025,
				NodeJS: true,
				ParentNode: 'readonly',
				DocumentEventMap: 'readonly',
				EventListenerOrEventListenerObject: 'readonly',
				AddEventListenerOptions: 'readonly'
			},
			parserOptions: {
				parser: tsParser
			}
		}
	},

	{
		rules: {
			...eslintReactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'no-undef': 'warn',
			'newline-before-return': 'warn',
			'react/display-name': 'off',
			'react/no-unescaped-entities': 'off',
			'@next/next/no-page-custom-font': 'off',
			'react-hooks/exhaustive-deps': 'off',
			'no-unused-vars': [
				'off',
				{
					vars: 'all',
					args: 'after-used',
					ignoreRestSiblings: false
				}
			],
			'no-extra-semi': 1,
			'@typescript-eslint/ban-ts-comment': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',

			'simple-import-sort/imports': [
				'warn',
				{
					groups: [
						['^\\u0000'],
						[
							'^react',
							'^@\\w',
							'^@?\\w',
							'^@assets(/.*|$)',
							'^@components(/.*|$)',
							'^@configs(/.*|$)',
							'^@views(/.*|$)',
							'^@constants(/.*|$)',
							'^@locales(/.*|$)',
							'^@mock(/.*|$)',
							'^@services(/.*|$)',
							'^@store(/.*|$)',
							'^@utils(/.*|$)',
							'^',
							'^\\.'
						],
						['^.+\\.scss$'],
						['^.+\\./styles.tsx$']
					]
				}
			],
			'import/newline-after-import': 'error',
			'import/no-duplicates': 'error',
			'simple-import-sort/exports': 'warn'
		}
	},

	{
		ignores: [
			'**/dist/**',
			'**/build/**',
			'**/node_modules/**',
			'**/coverage/**',
			'**/public/**',
			'.editorconfig',
			'postcss.config.js'
		]
	}
)

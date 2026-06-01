import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{
		ignores: [
			'dist/**',
			'coverage/**',
			'storybook-static/**',
			'node_modules/**',
			'**/*.d.ts',
			'build/**',
			'scripts/**',
		],
	},

	js.configs.recommended,
	...tseslint.configs.recommended,
	...pluginVue.configs['flat/recommended'],

	{
		files: ['**/*.{ts,vue}'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				console: 'readonly',
				navigator: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				requestAnimationFrame: 'readonly',
				cancelAnimationFrame: 'readonly',
				HTMLElement: 'readonly',
				HTMLInputElement: 'readonly',
				HTMLButtonElement: 'readonly',
				Event: 'readonly',
				MouseEvent: 'readonly',
				KeyboardEvent: 'readonly',
				TouchEvent: 'readonly',
				DragEvent: 'readonly',
				URL: 'readonly',
				DOMParser: 'readonly',
				IntersectionObserver: 'readonly',
				ResizeObserver: 'readonly',
				process: 'readonly',
			},
		},
		rules: {
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'off',
			'vue/multi-word-component-names': 'off',
			'no-undef': 'error',
			eqeqeq: ['error', 'smart'],
			'no-var': 'error',
			'prefer-const': 'warn',

			// Форматирование шаблонов контролируется стилем проекта (табы), не ESLint.
			'vue/html-indent': 'off',
			'vue/max-attributes-per-line': 'off',
			'vue/html-closing-bracket-newline': 'off',
			'vue/singleline-html-element-content-newline': 'off',
			'vue/multiline-html-element-content-newline': 'off',
			'vue/html-self-closing': 'off',
			'vue/attributes-order': 'off',
			'vue/one-component-per-file': 'off',
			// v-html используется осознанно (JSON-LD, SVG-иконки) с защитой от XSS.
			'vue/no-v-html': 'off',
		},
	},

	{
		files: ['**/*.spec.ts', '**/*.stories.ts'],
		languageOptions: {
			globals: {
				describe: 'readonly',
				it: 'readonly',
				test: 'readonly',
				expect: 'readonly',
				vi: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
			},
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'no-undef': 'off',
		},
	},
)

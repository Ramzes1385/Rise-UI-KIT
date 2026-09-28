import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import perfectionist from 'eslint-plugin-perfectionist'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import prettierConfig from 'eslint-config-prettier/flat'

export default tseslint.config(
	{
		ignores: ['dist/**', 'coverage/**', 'storybook-static/**', 'node_modules/**', '**/*.d.ts', 'build/**', 'scripts/**'],
	},

	js.configs.recommended,
	...tseslint.configs.recommended,
	...pluginVue.configs['flat/recommended'],

	{
		files: ['**/*.{ts,vue}'],
		plugins: { perfectionist },
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			globals: {
				...globals.browser,
				...globals.es2021,
				process: 'readonly',
			},
		},
		rules: {
			// Мёртвый код не оставляем: неиспользуемое удаляется, намеренно неиспользуемое начинается с `_`.
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'off',
			'vue/multi-word-component-names': 'off',
			'no-undef': 'error',
			eqeqeq: ['error', 'smart'],
			'no-var': 'error',
			'prefer-const': 'error',

			// Импорты — «лесенкой»: внутри группы строка не короче предыдущей, при равной длине — по алфавиту.
			// Группы: builtin/external → внутренние (@-алиасы) → относительные → типы. Импорт стилей не переставляется:
			// от его места зависит порядок CSS.
			'perfectionist/sort-imports': [
				'error',
				{
					type: 'line-length',
					order: 'asc',
					fallbackSort: { type: 'alphabetical', order: 'asc' },
					newlinesBetween: 0,
					internalPattern: ['^@/', '^@components(/|$)', '^@composables(/|$)', '^@utils(/|$)', '^@icons(/|$)', '^@styles(/|$)'],
					groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type', 'style', 'unknown'],
				},
			],

			// «Чистый код» (Р. Мартин): мало аргументов, неглубокая вложенность, без вложенных тернарников,
			// параметры не переприсваиваются, после return нет else.
			'max-params': ['error', 3],
			'max-depth': ['error', 3],
			'max-nested-callbacks': ['error', 3],
			'no-nested-ternary': 'error',
			'no-param-reassign': 'error',
			'no-else-return': ['error', { allowElseIf: false }],
			// Размер и сложность — предупреждения: существующий код доводится до них по компонентам.
			complexity: ['warn', 10],
			'max-statements': ['warn', 15],
			'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
			'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }],

			'vue/attributes-order': 'off',
			'vue/one-component-per-file': 'off',
			// v-html используется осознанно (JSON-LD, SVG-иконки) с защитой от XSS.
			'vue/no-v-html': 'off',
		},
	},

	{
		files: ['src/**/*.{ts,vue}'],
		ignores: ['src/**/types/*.types.ts', 'src/**/__tests__/**', 'src/**/*.stories.ts', 'src/**/*.d.ts'],
		rules: {
			'no-restricted-syntax': [
				'error',
				{
					selector: 'TSInterfaceDeclaration, TSTypeAliasDeclaration, TSEnumDeclaration',
					message: 'Типы объявляются в types/<имя>.types.ts',
				},
			],
		},
	},

	{
		files: ['src/**/types/*.types.ts'],
		rules: {
			'no-restricted-syntax': [
				'error',
				{
					selector: 'FunctionDeclaration, FunctionExpression, ArrowFunctionExpression, ClassDeclaration',
					message: 'В types/ только типы и константы, из которых они выводятся; логика — в model/',
				},
			],
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
			'no-undef': 'off',
			// describe → it → колбэки и длинные сценарии в тестах и stories — норма.
			complexity: 'off',
			'max-statements': 'off',
			'max-lines-per-function': 'off',
			'max-lines': 'off',
			'max-nested-callbacks': 'off',
		},
	},
	{
		files: ['**/*.cjs'],
		languageOptions: {
			sourceType: 'commonjs',
			globals: {
				...globals.node,
			},
		},
		rules: {
			'no-undef': 'off',
			'@typescript-eslint/no-require-imports': 'off',
		},
	},

	// Форматирование — забота Prettier: отключает правила ESLint, которые с ним спорят. Должен идти последним.
	prettierConfig,
)

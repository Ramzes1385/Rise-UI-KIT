import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import perfectionist from 'eslint-plugin-perfectionist'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import prettierConfig from 'eslint-config-prettier/flat'

const TYPES_OUTSIDE_TYPES_FOLDER = {
	selector: 'TSInterfaceDeclaration, TSTypeAliasDeclaration, TSEnumDeclaration',
	message: 'Типы объявляются в types/<имя>.types.ts',
}

const LOGIC_IN_MODEL = 'Логика компонента — в model/useBaseX.ts (docs/CONTRIBUTING.md, раздел 9)'

// Комментарии в коде компонентов запрещены: в скриптах и в шаблонах .vue
const RISE = {
	rules: {
		'no-comments': {
			meta: {
				type: 'suggestion',
				schema: [],
				messages: { comment: 'Комментариев в коде компонентов нет: описания — в stories (docs/CONTRIBUTING.md, раздел 11)' },
			},
			create(context) {
				return {
					Program() {
						const { sourceCode } = context
						const comments = [...sourceCode.getAllComments(), ...(sourceCode.ast.templateBody?.comments ?? [])]
						for (const comment of comments) context.report({ loc: comment.loc, messageId: 'comment' })
					},
				}
			},
		},
	},
}

const CLEAN_CODE_SIZE_RULES = {
	complexity: ['error', 10],
	'max-statements': ['error', 15],
	'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
	'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
}

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

			// Импорты — одной «лесенкой»: строка не короче предыдущей, при равной длине — по алфавиту. Сначала импорты
			// стилей, затем прочие импорты с побочным эффектом; между собой они не переставляются.
			'perfectionist/sort-imports': [
				'error',
				{
					type: 'line-length',
					order: 'asc',
					fallbackSort: { type: 'alphabetical', order: 'asc' },
					newlinesBetween: 0,
					groups: ['side-effect-style', 'side-effect', 'unknown'],
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
			// JSON-LD крошек — <component :is="'script'"> с v-html: это элемент script, а не компонент.
			'vue/no-v-text-v-html-on-component': ['error', { allow: ['component'] }],
		},
	},

	{
		files: ['src/**/*.{ts,vue}'],
		ignores: [
			'src/**/types/**/*.types.ts',
			'src/**/__tests__/**',
			'src/**/*.stories.ts',
			'src/components/*/stories/**',
			'src/stories/foundations/**',
			'src/**/*.d.ts',
		],
		rules: {
			'no-restricted-syntax': ['error', TYPES_OUTSIDE_TYPES_FOLDER],
		},
	},

	{
		files: ['src/components/**/model/**/*.ts'],
		rules: CLEAN_CODE_SIZE_RULES,
	},

	{
		files: ['src/components/**/*.{ts,vue}'],
		ignores: ['src/components/**/types/**/*.types.ts'],
		plugins: { rise: RISE },
		rules: { 'rise/no-comments': 'error' },
	},

	// Логика компонентов — в model/: в <script setup> только макросы, импорты для шаблона и вызов useBaseX
	{
		files: ['src/components/*/ui/**/*.vue'],
		rules: {
			'no-restricted-syntax': [
				'error',
				TYPES_OUTSIDE_TYPES_FOLDER,
				{ selector: 'Program > FunctionDeclaration', message: LOGIC_IN_MODEL },
				{ selector: 'Program > VariableDeclaration[kind="let"]', message: LOGIC_IN_MODEL },
				{ selector: 'Program > VariableDeclaration > VariableDeclarator[init.type!="CallExpression"]', message: LOGIC_IN_MODEL },
				{
					selector:
						'CallExpression[callee.name=/^(computed|ref|shallowRef|reactive|readonly|toRef|toRefs|watch|watchEffect|provide|inject|nextTick|useSlots|useAttrs|useId|useTemplateRef|onBeforeMount|onMounted|onBeforeUpdate|onUpdated|onBeforeUnmount|onUnmounted|onActivated|onDeactivated)$/]',
					message: LOGIC_IN_MODEL,
				},
				{
					selector: 'ImportDeclaration[source.value!=/\\/model\\//] > ImportSpecifier[imported.name=/^use[A-Z]/]',
					message: LOGIC_IN_MODEL,
				},
			],
		},
	},

	{
		files: ['src/**/types/**/*.types.ts'],
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
		files: ['**/*.spec.ts', '**/*.stories.ts', 'src/components/*/stories/**/*.ts', 'src/stories/foundations/**/*.ts'],
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

/**
 * Глобальная конфигурация Storybook: декораторы, параметры, темы.
 */

import type { Preview } from '@storybook/vue3-vite'

// Подавление неинформативных предупреждений в консоли браузера/Storybook
const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
	if (
		typeof args[0] === 'string' &&
		args[0].includes('decodeEntities option is passed but will be ignored in non-browser builds')
	) {
		return
	}
	originalWarn(...args)
}

import '../../src/styles/_variables.scss'
import '../../src/styles/index.scss'
import './forced-states.scss'

// Определение режима тестирования доступности (a11yTestMode):
// Проблема: при запуске тестов через кнопку "Run tests" в Storybook UI с включенным "Accessibility",
// отчёты axe-core (50-200 КБ на каждую историю) сериализуются через telejson и отправляются по WebSocket
// в менеджер. Для 800+ историй это генерирует гигабайты трафика, вызывая OOM и падение сервера по таймауту.
//
// Логика определения режима:
// 1. Vitest Browser запущен из CLI (CI=true) → режим 'error' — полный прогон axe-core с ошибками при нарушениях.
// 2. Vitest Browser запущен из Storybook UI (кнопка "Run tests", CI не пробрасывается) → режим 'off' —
//    axe-отчёты НЕ летят по WebSocket, сервер не падает. Панель "Accessibility" работает для активной истории.
// 3. Обычный режим разработки (не Vitest) → режим 'todo' — предупреждения в панели Accessibility.
const isVitestBrowser = typeof window !== 'undefined' && '__vitest_browser__' in window

// CI/CLI прогон (NODE_OPTIONS + cross-env) — реальный test
const isCliRun = typeof process !== 'undefined' && process.env?.CI === 'true'

// addon-vitest запуск ИЗ Storybook UI (кнопка Run tests) — НЕ хотим грузить WS axe-отчётами
const isAddonVitestFromUI = isVitestBrowser && !isCliRun

const a11yTestMode = isAddonVitestFromUI ? 'off' : isVitestBrowser ? 'error' : 'todo'

// Список правил axe-core с уровнем серьезности minor и moderate для отключения в тестах
const MINOR_MODERATE_RULES = [
	'accesskeys',
	'area-write-on-input',
	'blink',
	'contentinfo-is-top-level',
	'definition-list',
	'dlitem',
	'duplicate-id-active',
	'duplicate-id-aria',
	'frame-tested',
	'frame-title',
	'heading-order',
	'html-xml-lang-mismatch',
	'identical-links-same-purpose',
	'meta-viewport',
	'meta-viewport-large',
	'no-autoplay-audio',
	'object-alt',
	'p-as-heading',
	'scrollable-region-focusable',
	'tabindex',
	'target-size',
	'valid-lang',
	'video-caption',
	'focus-order-semantics',
	'meta-refresh',
	'empty-heading',
	'epub-type-has-matching-role',
	'frame-title-unique',
	'image-redundant-alt',
	'marquee',
	'scope-attr-valid',
	'skip-link',
	'uncommon-improper-aria',
]

const preview: Preview = {
	tags: ['autodocs'],

	parameters: {
		controls: {
			matchers: {
				// Исключаем точное совпадение с "color", так как в нашей дизайн-системе
				// проп "color" обычно принимает объект CustomColor, а не строку.
				color: /^(?!color$).*(background|color)$/i,
				date: /Date$/i,
			},
		},

		backgrounds: {
			options: {
				light: { name: 'Light', value: '#fafafa' },
				dark: { name: 'Dark', value: '#09090b' },
			},
		},

		a11y: {
			test: a11yTestMode,
			config: {
				rules: [
					// Отключаем правила уровня страницы, так как компоненты рендерятся изолированно
					{ id: 'html-has-lang', enabled: false },
					{ id: 'landmark-one-main', enabled: false },
					{ id: 'page-has-heading-one', enabled: false },
					{ id: 'bypass', enabled: false },
					{ id: 'region', enabled: false },
					// Отключаем автоматическую проверку контраста, так как она дает ложные срабатывания
					// на disabled-элементах, плейсхолдерах и кастомных темах дизайн-системы
					{ id: 'color-contrast', enabled: false },
					// minor/moderate правила: warning в dev, отключены в test env.
					// При test: 'error' ЛЮБОЕ включённое правило вызывает FAIL,
					// поэтому minor/moderate условно отключаются в CI —
					// только critical/serious нарушения приводят к FAIL.
					...MINOR_MODERATE_RULES.map(ruleId => ({
						id: ruleId,
						enabled: !isVitestBrowser,
					})),
				],
			},
		},
	},

	decorators: [
		story => ({
			components: {},
			template: '<story />',
		}),
	],
}

export default preview

/**
 * Глобальная конфигурация Storybook: стили, тема, порядок разделов, a11y.
 *
 * Тема переключается кнопкой «Тема» на панели инструментов (глобальная переменная `theme`).
 * Декоратор ставит `data-theme` на <html> iframe — так токены `--rise-*` переключаются и в canvas,
 * и на странице Docs, и в телепортированных оверлеях (Modal, Dropdown, Tooltip…).
 * Для скриншотов и ссылок тему можно задать в URL: `iframe.html?id=…&globals=theme:dark`.
 */

import { configure } from 'storybook/test'
import { STORY_WAIT_TIMEOUT } from '../../src/stories/helpers'
import type { Decorator, Preview } from '@storybook/vue3-vite'
import { theme as docsTheme } from './theme'

// @font-face регистрируются до токенов, чтобы Inter/JetBrains Mono были доступны сразу:
// иначе Linux CI рендерит DejaVu Sans, а Windows — Segoe UI, и visual-тесты получают лишний pixel-diff.
import '../../src/styles/_fonts.scss'
import '../../src/styles/index.scss'
import './preview.scss'

type Theme = 'light' | 'dark'

// findBy* и waitFor в play-функциях ждут до 3 с вместо 1 с: оверлеи с анимацией и прогон stories в CI
// под нагрузкой открываются дольше, а короткий таймаут давал случайные падения
configure({ asyncUtilTimeout: STORY_WAIT_TIMEOUT })

/** Начертания, которые используют stories: латиница и кириллица, прямое и курсив, моноширинный */
const FONT_SAMPLES = ['14px "Inter Variable"', 'italic 14px "Inter Variable"', '14px "JetBrains Mono Variable"']

/**
 * Шрифты загружаются до рендера story. Иначе подмена шрифта сдвигает раскладку уже во время play-функции:
 * например, прокрутка ленты BaseChat от смены высоты строк закрывала только что открытое меню сообщения.
 */
async function loadFonts(): Promise<void> {
	await Promise.all(FONT_SAMPLES.map(font => document.fonts.load(font, 'Aa Яя 09')))
}

const withTheme: Decorator = (story, context) => {
	const theme: Theme = context.globals.theme === 'dark' ? 'dark' : 'light'
	document.documentElement.setAttribute('data-theme', theme)
	return story()
}

const preview: Preview = {
	tags: ['autodocs'],

	beforeEach: loadFonts,

	globalTypes: {
		theme: {
			description: 'Тема оформления компонентов',
			toolbar: {
				title: 'Тема',
				icon: 'mirror',
				items: [
					{ value: 'light', title: 'Светлая', icon: 'sun' },
					{ value: 'dark', title: 'Тёмная', icon: 'moon' },
				],
				dynamicTitle: true,
			},
		},
	},

	initialGlobals: {
		theme: 'light',
	},

	decorators: [withTheme],

	parameters: {
		layout: 'padded',

		options: {
			storySort: {
				order: [
					'Introduction',
					'Foundations',
					['Colors', 'Typography', 'Radius & Shadows', 'Sizing', 'Theming'],
					'Element',
					'Form',
					'Data',
					'Navigation',
					'Overlay',
					'Chat',
					'Editor',
				],
			},
		},

		controls: {
			expanded: true,
			sort: 'requiredFirst',
			matchers: {
				// Проп `color` в библиотеке — объект CustomColor, а не строка: color-picker ему не подходит.
				color: /^(?!color$).*(background|color)$/i,
				date: /Date$/i,
			},
		},

		// Фон canvas задаёт тема (токен --rise-bg), а не аддон backgrounds.
		backgrounds: { disable: true },

		docs: {
			theme: docsTheme,
			toc: { headingSelector: 'h2, h3' },
		},

		a11y: {
			// В панели Accessibility нарушения показываются как предупреждения; в CI каждую story в обеих темах
			// проверяет scripts/check-stories.mjs (npm run test:stories) и падает на любом нарушении.
			test: 'todo',
			config: {
				rules: [
					// Правила уровня страницы: компонент рендерится изолированно, без <main>, заголовка h1 и lang.
					{ id: 'html-has-lang', enabled: false },
					{ id: 'landmark-one-main', enabled: false },
					{ id: 'page-has-heading-one', enabled: false },
					{ id: 'region', enabled: false },
					{ id: 'bypass', enabled: false },
				],
			},
		},
	},
}

export default preview

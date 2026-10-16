/**
 * Режим (`data-theme` на <html> iframe), бренд (`data-rise-theme`), язык и пресет движения (`data-rise-motion`) переключаются
 * глобальными переменными Storybook `theme`/`brand`/`locale`/`motion`; для скриншотов — `?globals=theme:dark;motion:none`.
 * `theme` — светлая или тёмная, `brand` — тема `createTheme()` поверх неё (пресеты и `custom` из конструктора): одна область
 * темы — `data-rise-theme` × `data-theme` на одном элементе (src/stories/helpers/theme/brand.ts).
 */

import { setup } from '@storybook/vue3-vite'
import { configure } from 'storybook/test'
import { LINK_COMPONENT_KEY } from '../../src/composables/interaction/useLink/useLink'
import { LOCALES, setLocale } from '../../src/locales/state'
import { MOTION_PRESETS, type MotionPreset } from '../../src/composables/app/useMotion/types/useMotion.types'
import { MOTION_ATTRIBUTE } from '../../src/composables/app/useMotion/motionTokens'
import { applyStoryBrand, STORY_BRAND_DEFAULT, STORY_WAIT_TIMEOUT, StoryRouterLink } from '../../src/stories/helpers'
import type { Decorator, Preview } from '@storybook/vue3-vite'
import { theme as docsTheme } from './theme'

// @font-face регистрируются до токенов, чтобы Inter/JetBrains Mono были доступны сразу:
// иначе Linux CI рендерит DejaVu Sans, а Windows — Segoe UI, и visual-тесты получают лишний pixel-diff.
import '../../src/styles/fonts/_fonts.scss'
import '../../src/styles/index.scss'
import './preview.scss'

type Theme = 'light' | 'dark'

// Ссылки на маршруты (`to`) во всех stories — StoryRouterLink, как RouterLink в приложении: клик не уводит
// iframe со страницы Storybook (пункты BaseMegaMenu и BaseDropdownMenu, крошки, боковая панель)
// У каждой story своё приложение Vue, а `useId()` считает id внутри приложения: на странице Docs у соседних stories
// совпадали id и `name` радиогрупп (BaseRadio, BaseSegmented), и выбор в одной story снимал его в другой
let appCount = 0
setup(app => {
	app.config.idPrefix = `story${++appCount}`
	app.provide(LINK_COMPONENT_KEY, StoryRouterLink)
})

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
	await Promise.all(FONT_SAMPLES.map(font => document.fonts.load(font, 'Aa Яя 09 Әә')))
}

/** Внутренний объект Storybook: текущая отрисовка story и её настройки (`autoplay` — запускать ли play) */
type PreviewWindow = Window & { __STORYBOOK_PREVIEW__?: { currentRender?: { renderOptions?: { autoplay?: boolean } } } }

/** Story в рамке на странице Docs: `docs.story.inline: false` даёт iframe с id `iframe--<id story>` */
const isDocsFrame = (): boolean => window.frameElement?.id.startsWith('iframe--') === true

/**
 * В рамке на странице Docs play не запускается: Docs показывает начальное состояние, оверлеи открываются кликом,
 * а не сами при загрузке страницы. На холсте story, в check-stories и скриншот-тестах play работает как прежде.
 * `autoplay` — внутренняя настройка Storybook; если её не станет, play просто снова запустится.
 */
function holdPlayInDocsFrame(): void {
	const render = isDocsFrame() ? (window as PreviewWindow).__STORYBOOK_PREVIEW__?.currentRender : undefined
	if (render?.renderOptions) render.renderOptions.autoplay = false
}

/**
 * В рамке на странице Docs фокус (в том числе `autofocus`) и `scrollIntoView` ждут первого нажатия или клика
 * пользователя на странице. Иначе окно, открытое через `args` (BaseTour, BasePopconfirm), забирало фокус или
 * прокручивало к цели, и браузер прокручивал вместе с ним страницу Docs.
 */
function guardDocsFrameFocus(): void {
	if (!isDocsFrame()) return
	let isUserActive = false
	const activate = (event: Event): void => {
		if (event.isTrusted) isUserActive = true
	}
	for (const target of [window, window.parent]) {
		target.addEventListener('pointerdown', activate, true)
		target.addEventListener('keydown', activate, true)
	}
	window.addEventListener(
		'focusin',
		event => {
			if (isUserActive || !(event.target instanceof HTMLElement)) return
			const frame = window.frameElement as HTMLElement
			event.target.blur()
			frame.blur()
		},
		true,
	)
	const { focus } = HTMLElement.prototype
	const { scrollIntoView } = Element.prototype
	HTMLElement.prototype.focus = function focusInDocsFrame(this: HTMLElement, options?: FocusOptions): void {
		if (isUserActive) focus.call(this, options)
	}
	Element.prototype.scrollIntoView = function scrollInDocsFrame(this: Element, options?: boolean | ScrollIntoViewOptions): void {
		if (isUserActive) scrollIntoView.call(this, options)
	}
}

guardDocsFrameFocus()

const withTheme: Decorator = (story, context) => {
	const theme: Theme = context.globals.theme === 'dark' ? 'dark' : 'light'
	document.documentElement.setAttribute('data-theme', theme)
	// бренд — после режима, на тот же <html>: область темы — `data-rise-theme` и `data-theme` на одном элементе
	applyStoryBrand(context.globals.brand)
	return story()
}

/** Пресет движения всей страницы — как опция плагина `motion`; области внутри истории задают свой `data-rise-motion` */
const withMotion: Decorator = (story, context) => {
	const motion = context.globals.motion as MotionPreset
	document.documentElement.setAttribute(MOTION_ATTRIBUTE, MOTION_PRESETS.includes(motion) ? motion : 'standard')
	return story()
}

/** Язык строк кита: тексты stories остаются русскими, меняются строки самих компонентов и формат дат; любой код из `LOCALES`, иначе `ru`; lang у zh и ja нужен для шрифтов */
const withLocale: Decorator = (story, context) => {
	const code = String(context.globals.locale)
	setLocale(code in LOCALES ? (code as keyof typeof LOCALES) : 'ru')
	document.documentElement.lang = code === 'zh' || code === 'ja' ? code : 'en'
	return story()
}

const preview: Preview = {
	tags: ['autodocs'],

	beforeEach: async () => {
		holdPlayInDocsFrame()
		await loadFonts()
	},

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
		brand: {
			description: 'Бренд: тема createTheme() поверх режима «Тема» — пресеты THEME_PRESETS и custom из «Конструктора темы»',
			toolbar: {
				title: 'Бренд',
				icon: 'paintbrush',
				items: [
					{ value: 'rise', title: 'Rise — кит как есть' },
					{ value: 'corporate', title: 'Corporate' },
					{ value: 'playful', title: 'Playful' },
					{ value: 'minimal', title: 'Minimal' },
					{ value: 'custom', title: 'Custom — из конструктора' },
				],
				dynamicTitle: true,
			},
		},
		motion: {
			description: 'Пресет движения: длительности, кривые, сдвиг и масштаб появления',
			toolbar: {
				title: 'Движение',
				icon: 'transfer',
				items: [
					{ value: 'none', title: 'Нет' },
					{ value: 'subtle', title: 'Сдержанно' },
					{ value: 'standard', title: 'Стандарт' },
					{ value: 'expressive', title: 'Выразительно' },
				],
				dynamicTitle: true,
			},
		},
		locale: {
			description: 'Язык строк компонентов',
			toolbar: {
				title: 'Язык',
				icon: 'globe',
				items: [
					{ value: 'ru', title: 'Русский' },
					{ value: 'en', title: 'English' },
					{ value: 'kk', title: 'Қазақша' },
					{ value: 'uz', title: 'Oʻzbekcha' },
					{ value: 'zh', title: '中文' },
					{ value: 'ja', title: '日本語' },
				],
				dynamicTitle: true,
			},
		},
	},

	initialGlobals: {
		theme: 'light',
		brand: STORY_BRAND_DEFAULT,
		motion: 'standard',
		locale: 'ru',
	},

	decorators: [withTheme, withMotion, withLocale],

	parameters: {
		layout: 'padded',

		options: {
			storySort: {
				order: [
					'Introduction',
					'Foundations',
					['Colors', 'Typography', 'Radius & Shadows', 'Sizing', 'Theming', 'Конструктор темы', 'Motion'],
					'Blocks',
					['Auth', 'Settings', 'Dashboard'],
					'Element',
					'Form',
					'Data',
					'Navigation',
					'Layout',
					'Overlay',
					'Chat',
					'Editor',
					'Media',
					'Composables',
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

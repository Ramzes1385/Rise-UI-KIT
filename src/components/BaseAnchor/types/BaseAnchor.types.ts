import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseAnchor: `default` — линия сбоку (снизу у горизонтального) с отметкой текущего раздела,
 * `soft` — текущий раздел выделен мягкой заливкой
 */
export const ANCHOR_VARIANTS = ['default', 'soft'] as const

/** Направление списка: `vertical` — колонка сбоку от текста, `horizontal` — строка над текстом */
export const ANCHOR_DIRECTIONS = ['vertical', 'horizontal'] as const

export type AnchorDirection = (typeof ANCHOR_DIRECTIONS)[number]

/**
 * Части оглавления для пропа `ui` (БЭМ-элементы `.base-anchor__<часть>`, `root` — `<nav>`): list — список `<ol>`,
 * item — пункт `<li>`, link — ссылка пункта, indicator — отметка текущего пункта (линия у `default`, заливка у `soft`),
 * одна на оглавление и переезжает к новому текущему пункту.
 */
export const ANCHOR_PARTS = ['list', 'item', 'link', 'indicator'] as const

export type BaseAnchorPart = (typeof ANCHOR_PARTS)[number]

/** Пункт оглавления, заданный приложением */
export interface AnchorItem {
	/** id элемента раздела на странице; ссылка ведёт на `#id` */
	id: string
	/** Подпись пункта */
	label: string
	/** Вложенные пункты (подразделы) — со сдвигом вправо */
	children?: AnchorItem[]
}

/** Пункт оглавления, как его показывает BaseAnchor: из `items` или из заголовков */
export interface AnchorLink {
	/** id элемента раздела */
	id: string
	/** Подпись */
	label: string
	/** Уровень вложенности: 0 — верхний */
	level: number
}

/**
 * Пропсы компонента BaseAnchor — оглавление страницы с подсветкой текущего раздела при прокрутке.
 * Пункты — из `items` или из заголовков `headings` внутри `content`. Отметка текущего пункта одна на оглавление
 * и переезжает к новому пункту на токенах движения; при выключенном движении — сразу на месте.
 */
export interface BaseAnchorProps extends BaseComponentProps<(typeof ANCHOR_VARIANTS)[number], 'root' | 'list' | 'item' | 'link'> {
	/** Пункты оглавления. Не задано — пункты собираются из заголовков `headings` внутри `content` */
	items?: AnchorItem[]
	/** Прокручиваемый контейнер — CSS-селектор или элемент; по умолчанию окно */
	target?: string | HTMLElement
	/**
	 * Где искать заголовки без `items` — CSS-селектор или элемент. По умолчанию — `target`, для окна — `<main>` страницы
	 * (нет `<main>` — `<body>`). Заголовку без id присваивается id
	 */
	content?: string | HTMLElement
	/** CSS-селектор заголовков, из которых собирается оглавление; уровень — по номеру тега (`h2` выше `h3`) */
	headings?: string
	/** Отступ сверху (px), например высота закреплённой шапки: раздел прокручивается под неё, текущий считается от неё */
	offset?: number
	/** Текущий раздел — id (`v-model:active`) */
	active?: string
	/** Направление списка */
	direction?: AnchorDirection
	/** Доступное имя `<nav>` (по умолчанию «Содержание») */
	label?: string
	/** По клику менять адрес страницы на `#id` раздела (`history.replaceState`, без новой записи в истории) */
	isHashSynced?: boolean
	/**
	 * Классы частей оглавления (`root`, `list`, `item`, `link`, `indicator`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseAnchor: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseAnchor :items="items" :ui="{ link: 'text-sm', indicator: 'rounded-full' }" />
	 */
	ui?: UiProp<BaseAnchorPart>
}

export interface BaseAnchorEmits {
	/** Сменился текущий раздел — при прокрутке или по клику */
	(event: 'update:active', value: string): void
	/** Клик по пункту — до перехода; с Ctrl, Shift, Alt или Cmd ссылка работает как обычная, без перехвата */
	(event: 'click', item: AnchorLink, value: MouseEvent): void
}

/**
 * Слоты компонента BaseAnchor
 */
export interface BaseAnchorSlots {
	/** Содержимое ссылки пункта вместо подписи */
	item?: (props: { item: AnchorLink; isActive: boolean }) => unknown
}

/** Методы BaseAnchor через ref */
export interface BaseAnchorExpose {
	/** Пересобрать пункты и наблюдение: после изменения заголовков на странице */
	refresh: () => void
	/** Перейти к разделу по id: прокрутка (плавно, если не включено уменьшение движения) и фокус на разделе */
	scrollTo: (id: string) => void
}

export type AnchorProps = PropsWithDefaults<BaseAnchorProps, 'headings' | 'offset' | 'direction' | 'isHashSynced'>

/** Прокручиваемый контейнер оглавления: элемент или окно */
export type AnchorScrollTarget = HTMLElement | Window

/** Параметры прокрутки к разделу (внутреннее) */
export interface AnchorScrollOptions {
	/** Отступ сверху, px */
	offset: number
	/** Системная настройка «уменьшить движение»: прокрутка без анимации */
	isReducedMotion: boolean
}

/** Настройки наблюдения за разделами (внутреннее) */
export interface AnchorSpyOptions {
	getLinks: () => AnchorLink[]
	getOffset: () => number
	onChange: (id: string) => void
}

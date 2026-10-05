import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты маркеров: default — круг цвета события с белой иконкой или точкой; soft — мягкий фон и иконка цвета события;
 * outline — кольцо цвета события на фоне страницы
 */
export const TIMELINE_VARIANTS = ['default', 'soft', 'outline'] as const

/**
 * Части ленты для пропа `ui` (БЭМ-элементы `.base-timeline__<часть>`, `root` — сам `<ol>`):
 * item — событие (`<li>`); date — дата или время; marker — круг маркера; icon — иконка в маркере; dot — точка в маркере
 * без иконки; line — линия до следующего события; content — колонка с текстом; day — заголовок дня при `isGrouped`;
 * title — заголовок события; description — описание; media — картинка события (BaseImage).
 */
export const TIMELINE_PARTS = ['item', 'date', 'marker', 'icon', 'dot', 'line', 'content', 'day', 'title', 'description', 'media'] as const

export type BaseTimelinePart = (typeof TIMELINE_PARTS)[number]

export type TimelineColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

/** Место даты: `top` — над заголовком, `side` — отдельной колонкой слева от ленты (только вертикальной) */
export const TIMELINE_DATE_POSITIONS = ['top', 'side'] as const

export type TimelineDatePosition = (typeof TIMELINE_DATE_POSITIONS)[number]

/** Картинка события: снимок, скриншот, превью документа */
export interface TimelineMedia {
	/** Адрес картинки */
	src: string
	/** Описание картинки для экранного диктора */
	alt: string
}

export interface TimelineItem {
	/** Уникальный ключ */
	id: string | number
	/** Заголовок события */
	title: string
	/** Описание под заголовком */
	description?: string
	/** Время события: `Date` или строка ISO показываются в формате языка (`dateFormat`), другая строка — как есть */
	date?: Date | string
	/** Иконка в маркере (имя из спрайта) */
	icon?: string
	/** Цвет маркера (по умолчанию primary) */
	color?: TimelineColor
	/** Картинка под описанием (BaseImage): 16:9, по клику открывается крупно */
	media?: TimelineMedia
}

export interface BaseTimelineProps extends BaseComponentProps<
	(typeof TIMELINE_VARIANTS)[number],
	'root' | 'item' | 'marker' | 'content' | 'day' | 'date' | 'media'
> {
	/** События сверху вниз (или слева направо) */
	items: TimelineItem[]
	/** Текущее событие: у него `aria-current="step"`, следующие приглушены как предстоящие */
	currentId?: string | number
	/** Направление ленты */
	orientation?: 'vertical' | 'horizontal'
	/** Формат даты (Intl.DateTimeFormat); по умолчанию — «12 мая 2026 г.», при `isGrouped` — время «10:24» */
	dateFormat?: Intl.DateTimeFormatOptions
	/** События по дням: над первым событием дня — заголовок дня («12 мая 2026 г.»), у событий — только время */
	isGrouped?: boolean
	/** Место даты: над заголовком (`top`, по умолчанию) или колонкой слева от ленты (`side`, только вертикальная лента) */
	datePosition?: TimelineDatePosition
	/**
	 * Классы частей ленты (`root`, `item`, `marker`, `dot`, `line`, `title`…) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseTimeline: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseTimeline :items="events" :ui="{ marker: 'shadow-md', title: 'uppercase' }" />
	 */
	ui?: UiProp<BaseTimelinePart>
}

export interface BaseTimelineSlots {
	/** Своё содержимое события (маркер и линию рисует компонент) */
	item?: (props: { item: TimelineItem; index: number; isCurrent: boolean; isUpcoming: boolean }) => unknown
	/** Содержимое одного события по его `id`: `item-deploy` — событие `deploy`; у остальных — `item` */
	[name: `item-${string}`]:
		((props: { item: TimelineItem; index: number; isCurrent: boolean; isUpcoming: boolean }) => unknown) | undefined
}

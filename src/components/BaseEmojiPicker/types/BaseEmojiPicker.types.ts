import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseEmojiPicker: `default` — панель в рамке, `soft` — на подложке без рамки,
 * `outline` — рамка без фона, `ghost` — без рамки и фона (внутри поповера или меню)
 */
export const EMOJI_PICKER_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Части пикера для пропа `ui` (БЭМ-элементы `.base-emoji-picker__<часть>`, `root` — сама панель):
 * search — строка поиска с иконкой, input — поле поиска, nav — ряд вкладок разделов, tab — вкладка раздела,
 * grid — прокручиваемая сетка, heading — заголовок раздела, emoji — ячейка-кнопка эмодзи, preview — строка предпросмотра
 */
export const EMOJI_PICKER_PARTS = ['search', 'input', 'nav', 'tab', 'grid', 'heading', 'emoji', 'preview'] as const

export type BaseEmojiPickerPart = (typeof EMOJI_PICKER_PARTS)[number]

/** Разделы эмодзи в порядке Unicode */
export const EMOJI_CATEGORIES = ['smileys', 'people', 'nature', 'food', 'travel', 'activities', 'objects', 'symbols'] as const

/** Раздел эмодзи */
export type EmojiCategory = (typeof EMOJI_CATEGORIES)[number]

/** Эмодзи: символ, название (по нему идёт поиск и его читает скринридер) и раздел */
export interface EmojiPickerItem {
	emoji: string
	label: string
	category: EmojiCategory
}

/** Раздел сетки: недавние, результаты поиска или раздел Unicode; `offset` — номер первого эмодзи раздела в сетке */
export interface EmojiPickerSection {
	id: EmojiCategory | 'recent' | 'results'
	label: string
	icon: string
	items: EmojiPickerItem[]
	offset: number
}

/**
 * Пропсы компонента BaseEmojiPicker
 */
export interface BaseEmojiPickerProps extends BaseComponentProps<
	(typeof EMOJI_PICKER_VARIANTS)[number],
	'root' | 'search' | 'nav' | 'grid' | 'preview'
> {
	/** Недавние эмодзи (`v-model:recent`): выбранный эмодзи встаёт первым */
	recent?: string[]
	/** Сколько недавних хранить */
	maxRecent?: number
	/** Эмодзи в строке сетки */
	columns?: number
	/**
	 * Свой набор эмодзи. По умолчанию — встроенный: эмодзи Unicode до версии 14.0 с названиями CLDR на языке кита,
	 * загружается отдельным файлом при первом показе
	 */
	emojis?: readonly EmojiPickerItem[]
	/** Поле поиска по названиям */
	hasSearch?: boolean
	/** Строка с крупным эмодзи и названием под сеткой */
	hasPreview?: boolean
	/** Отключает поиск и выбор */
	isDisabled?: boolean
	/**
	 * Классы частей пикера (`root`, `search`, `input`, `nav`, `tab`, `grid`, `heading`, `emoji`, `preview`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseEmojiPicker: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseEmojiPicker :ui="{ root: 'shadow-lg', emoji: 'rounded-full' }" />
	 */
	ui?: UiProp<BaseEmojiPickerPart>
}

/**
 * События компонента BaseEmojiPicker
 */
export interface BaseEmojiPickerEmits {
	/** Выбран эмодзи: кликом, Enter или Space */
	(event: 'select', item: EmojiPickerItem): void
	/** Новый список недавних после выбора */
	(event: 'update:recent', value: string[]): void
}

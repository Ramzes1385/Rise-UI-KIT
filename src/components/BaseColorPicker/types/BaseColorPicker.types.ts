import type { ColorFormat } from '@utils/data/colorUtils'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Позиция всплывающей панели относительно триггера */
export const COLOR_PICKER_POSITIONS = ['top', 'bottom', 'left', 'right'] as const

export type ColorPickerPosition = (typeof COLOR_PICKER_POSITIONS)[number]

/** Именованная палитра под пресетами: подпись и цвета */
export interface ColorPalette {
	/** Подпись группы, она же доступное имя группы образцов */
	label: string
	/** Цвета палитры в любом поддерживаемом формате (HEX, `rgb()`, `hsl()`) */
	colors: readonly string[]
}

export interface BaseColorPickerProps extends BaseComponentProps<string, 'root' | 'swatch' | 'panel' | 'fields' | 'preset' | 'reset'> {
	/** Цвет (v-model): HEX (`#rgb`, `#rrggbb`, с прозрачностью `#rrggbbaa`), `rgb()` / `rgba()` или `hsl()` / `hsla()`. Наружу уходит в формате `format`; выбранный пресет и введённый HEX — без искажений */
	modelValue: string
	/** Формат значения v-model: `hex` (по умолчанию), `rgb` или `hsl`. С прозрачностью — `#rrggbbaa`, `rgba()`, `hsla()` */
	format?: ColorFormat
	/** Форматы полей ввода в панели и порядок кнопок переключателя. Один формат — без переключателя. По умолчанию — HEX, RGB и HSL */
	formats?: readonly ColorFormat[]
	/** Прозрачность: ползунок под тоном и поле «A» в процентах */
	hasAlpha?: boolean
	/** Сторона, с которой открывается панель */
	position?: ColorPickerPosition
	/** Цвета-пресеты под областью выбора (по умолчанию — 12 цветов) */
	presets?: readonly string[]
	/** Именованные палитры под пресетами, например фирменные цвета и цвета статусов */
	palettes?: readonly ColorPalette[]
	/** Недавние цвета (v-model:recent-colors): цвет попадает в начало списка, когда панель закрывается после изменения. Без v-model список хранится внутри компонента */
	recentColors?: readonly string[]
	/** Сколько недавних цветов хранить */
	maxRecentColors?: number
	/** Скрыть недавние цвета */
	isRecentHidden?: boolean
	/** Скрыть кнопку пипетки. Она видна только в браузерах с EyeDropper API (Chrome, Edge) */
	isEyeDropperHidden?: boolean
	/** Скрыть поля ввода цвета (HEX, RGB, HSL) */
	isHexHidden?: boolean
	/** Скрыть пресеты */
	isPresetsHidden?: boolean
	/** Показать кнопку сброса цвета (событие `reset`) */
	isResettable?: boolean
	/** Текст кнопки сброса */
	resetLabel?: string
	/** Не заливать образец цветом — для своего содержимого в слоте `trigger` (например, иконки) */
	hasTransparentSwatch?: boolean
	/** Отключённое состояние: образец не открывает панель */
	isDisabled?: boolean
}

export interface BaseColorPickerEmits {
	/** Новый цвет (v-model) в формате `format` */
	(event: 'update:modelValue', value: string): void
	/** Цвет изменён пользователем: пресет, поле ввода, тон, прозрачность, пипетка или область выбора */
	(event: 'change', value: string): void
	/** Нажата кнопка сброса (`isResettable`) */
	(event: 'reset'): void
	/** Новый список недавних цветов (v-model:recent-colors) */
	(event: 'update:recentColors', value: string[]): void
}

export interface BaseColorPickerSlots {
	/** Содержимое образца-триггера (например, иконка при `hasTransparentSwatch`) */
	trigger?: () => unknown
}

export type ColorPickerProps = BaseColorPickerProps &
	Required<Pick<BaseColorPickerProps, 'format' | 'formats' | 'hasAlpha' | 'maxRecentColors' | 'isRecentHidden' | 'isEyeDropperHidden'>>

/** Канал цвета в полях панели: RGB, HSL или прозрачность */
export type ColorChannelKey = 'r' | 'g' | 'b' | 'h' | 's' | 'l' | 'a'

/** Поле канала в панели */
export interface ColorChannelField {
	key: ColorChannelKey
	/** Доступное имя поля: «Красный», «Тон», «Непрозрачность» */
	label: string
	/** Короткая подпись под полем: R, G, B, H, S, L, A */
	short: string
	value: number
	max: number
}

/** Результат EyeDropper API */
interface EyeDropperResult {
	sRGBHex: string
}

/** Конструктор EyeDropper API (есть не во всех браузерах) */
export type EyeDropperConstructor = new () => { open: () => Promise<EyeDropperResult> }

/** Группа образцов в панели: пресеты, палитра или недавние цвета */
export interface ColorSwatchesProps {
	/** Подпись группы; без подписи группа без заголовка */
	label?: string
	/** Доступное имя группы, если подписи нет */
	ariaLabel?: string
	colors: readonly string[]
	/** Выбран ли образец */
	isSelected: (color: string) => boolean
	/** Класс образца (`customClass.preset`) */
	swatchClass?: string
}

export interface ColorSwatchesEmits {
	(event: 'select', color: string): void
}

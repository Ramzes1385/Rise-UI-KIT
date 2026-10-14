import type { CSSProperties } from 'vue'
import type { ColorFormat } from '@utils/data/colorUtils'
import type { UiClassFn, UiProp } from '@composables/base/useUi'
import type { FieldInputAttrs } from '@composables/form/useFormContext'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Позиция всплывающей панели относительно триггера */
export const COLOR_PICKER_POSITIONS = ['top', 'bottom', 'left', 'right'] as const

export type ColorPickerPosition = (typeof COLOR_PICKER_POSITIONS)[number]

/** Вид кнопки-триггера: образец, залитый цветом, или плоская кнопка-иконка */
export const COLOR_PICKER_TRIGGER_VARIANTS = ['swatch', 'icon'] as const

export type ColorPickerTriggerVariant = (typeof COLOR_PICKER_TRIGGER_VARIANTS)[number]

/**
 * Части выбора цвета для пропа `ui` (БЭМ-элементы `.base-color-picker__<часть>`, `root` — корень): swatch — образец-триггер,
 * popover — всплывающая панель, panel — содержимое панели, area — область насыщенности и яркости, marker — её маркер,
 * controls, eyedropper — пипетка, preview, sliders, track — шкала с бегунком, thumb — бегунок, hue, alpha, fields, formats,
 * format — кнопка формата, inputs, channel, hex, channel-input, channel-caption, library, swatches — группа образцов,
 * swatches-label, presets, preset — образец цвета, reset.
 */
export const COLOR_PICKER_PARTS = [
	'swatch',
	'popover',
	'panel',
	'area',
	'marker',
	'controls',
	'eyedropper',
	'preview',
	'sliders',
	'track',
	'thumb',
	'hue',
	'alpha',
	'fields',
	'formats',
	'format',
	'inputs',
	'channel',
	'hex',
	'channel-input',
	'channel-caption',
	'library',
	'swatches',
	'swatches-label',
	'presets',
	'preset',
	'reset',
] as const

export type BaseColorPickerPart = (typeof COLOR_PICKER_PARTS)[number]

/** Именованная палитра под пресетами: подпись и цвета */
export interface ColorPalette {
	/** Подпись группы, она же доступное имя группы образцов */
	label: string
	/** Цвета палитры в любом поддерживаемом формате (HEX, `rgb()`, `hsl()`) или токен `var(--rise-primary)`: выбор токена отдаёт в v-model саму строку */
	colors: readonly string[]
}

export interface BaseColorPickerProps extends BaseComponentProps<string, 'root' | 'swatch' | 'panel' | 'fields' | 'preset' | 'reset'> {
	/** Цвет (v-model): токен `var(--rise-primary)` (панель показывает его цвет в текущей теме, правка в панели заменяет токен обычным цветом) или HEX (`#rgb`, `#rrggbb`, с прозрачностью `#rrggbbaa`), `rgb()` / `rgba()` или `hsl()` / `hsla()`. Наружу уходит в формате `format`; выбранный пресет и введённый HEX — без искажений */
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
	/** Вид кнопки-триггера: `swatch` — образец, залитый цветом (по умолчанию); `icon` — плоская кнопка-иконка 28 px без заливки для тулбара, иконка — в слоте `trigger`. Своего CSS поверх `.base-color-picker__swatch` не нужно */
	triggerVariant?: ColorPickerTriggerVariant
	/** Только при `triggerVariant="icon"`: полоска текущего цвета под иконкой */
	hasIndicator?: boolean
	/** Не заливать образец цветом — для своего содержимого в слоте `trigger` (например, иконки) */
	hasTransparentSwatch?: boolean
	/** Отключённое состояние: образец не открывает панель */
	isDisabled?: boolean
	/** Что выбирает цвет — имя кнопки-образца без видимой подписи: «Цвет фона, выбран #ff0000» */
	ariaLabel?: string
	/** Атрибуты кнопки-образца: `id`, `aria-*`, `data-*` */
	triggerAttrs?: FieldInputAttrs
	/**
	 * Классы частей выбора цвета (`root`, `swatch`, `panel`, `area`, `marker`, `preset`… — см. `COLOR_PICKER_PARTS`) — добавляются
	 * к классам кита. Глобально — `defaults.BaseColorPicker.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseColorPicker v-model="color" :ui="{ swatch: 'rounded-full', preset: 'ring-1' }" />
	 */
	ui?: UiProp<BaseColorPickerPart>
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
	/** Классы частей из пропа `ui` выбора цвета: БЭМ-класс кита и классы приложения */
	ui: UiClassFn<BaseColorPickerPart>
}

/** Стиль положения маркера области: координаты в процентах области и цвет */
export interface ColorPickerMarkerStyle extends CSSProperties {
	'--picker-marker-x': string
	'--picker-marker-y': string
	backgroundColor: string
}

export interface ColorSwatchesEmits {
	(event: 'select', color: string): void
}

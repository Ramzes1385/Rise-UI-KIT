import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const RADIO_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'bordered'] as const

/** Части пункта группы — блок `.base-radio-item`: item — сам пункт (`<label>`), остальные — его элементы `.base-radio-item__<часть>` */
export const RADIO_ITEM_PARTS = ['item', 'wrapper', 'input', 'circle', 'dot', 'option-label'] as const

/**
 * Части группы для пропа `ui`. Элементы `.base-radio__<часть>` (`root` — корень): label — заголовок, required — звёздочка,
 * options — список пунктов, error-text — текст ошибки. Пункт — блок `.base-radio-item`: item — `<label>` пункта,
 * wrapper — обёртка поля, input — нативный radio, circle — круг, dot — точка выбора, option-label — подпись пункта.
 */
export const RADIO_PARTS = ['label', 'required', 'options', 'error-text', ...RADIO_ITEM_PARTS] as const

export type BaseRadioItemPart = (typeof RADIO_ITEM_PARTS)[number]

export type BaseRadioPart = (typeof RADIO_PARTS)[number]

export interface BaseRadioOption {
	value: string | number
	label: string
	isDisabled?: boolean
}

export interface BaseRadioProps extends BaseComponentProps<
	(typeof RADIO_VARIANTS)[number],
	'root' | 'label' | 'options' | 'radio' | 'wrapper' | 'input' | 'circle' | 'dot' | 'optionLabel' | 'errorText'
> {
	/** Выбранное значение */
	modelValue: string | number
	/** Список опций */
	options: BaseRadioOption[]
	/** Имя группы */
	name: string
	/** Заголовок группы */
	label?: string
	/** Имя группы без видимого заголовка (`aria-label`) */
	ariaLabel?: string
	/** Обязательное поле */
	isRequired?: boolean
	/** Вертикальное расположение */
	isVertical?: boolean
	/** Текст ошибки */
	error?: string
	/**
	 * Классы частей группы (`root`, `options`, `item`, `circle`, `dot`… — см. `RADIO_PARTS`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseRadio: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseRadio v-model="plan" name="plan" :options="plans" :ui="{ item: 'rounded-lg', dot: 'scale-125' }" />
	 */
	ui?: UiProp<BaseRadioPart>
}

export interface BaseRadioEmits {
	(event: 'update:modelValue', value: string | number): void
	(event: 'change', value: string | number): void
}

export interface BaseRadioSlots {
	/** Кастомная подпись опции. Нативный radio и индикатор рендерит компонент, поэтому выбор, клавиатура и роль radio сохраняются */
	option?: (props: { option: BaseRadioOption; isChecked: boolean }) => unknown
}

export type RadioProps = PropsWithDefaults<BaseRadioProps, 'isRequired'>

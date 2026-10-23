import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const TEXT_TAGS = ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'small', 'strong', 'em'] as const

/** Части текста для пропа `ui`: своих БЭМ-элементов у текста нет — только `root` (сам тег) */
export const TEXT_PARTS = [] as const

export type BaseTextPart = (typeof TEXT_PARTS)[number]

export interface BaseTextProps extends BaseComponentProps<string, 'root'> {
	/** Семантический HTML-тег */
	tag?: (typeof TEXT_TAGS)[number]
	/**
	 * Начертание (100–900). По умолчанию не задано: вес не пишется в `style` и берётся из тега (`h1–h6`, `strong` — жирные),
	 * наследуется или задаётся CSS приложения. Явное значение пропа пишется inline и сильнее любого CSS.
	 * Вернуть прежние 400 везде — `createUiKitPlugin({ defaults: { BaseText: { weight: 400 } } })`
	 */
	weight?: number
	/** Текст с переносом или без */
	nowrap?: boolean
	/** Обрезка текста с многоточием */
	truncate?: boolean
	/** Количество строк перед обрезкой (только с truncate) */
	maxLines?: number
	/**
	 * Классы частей текста (`root`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseText: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseText :ui="{ root: 'text-balance' }">Заголовок раздела</BaseText>
	 */
	ui?: UiProp<BaseTextPart>
}

export type BaseTextEmits = Record<string, never>

export interface BaseTextSlots {
	default?: () => unknown
}

export type TextProps = PropsWithDefaults<BaseTextProps, 'sizeScale' | 'maxLines'>

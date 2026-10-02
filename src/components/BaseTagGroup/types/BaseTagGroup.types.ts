import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { TAG_VARIANTS, TagTone } from '@components/BaseTag/types/BaseTag.types'

/**
 * Выбор в группе: none — метки только показываются (и удаляются), single — одна выбранная (`modelValue` — значение
 * или `null`), multiple — несколько (`modelValue` — массив). Выбираемые метки — кнопки-переключатели с `aria-pressed`
 */
export const TAG_GROUP_SELECTION_MODES = ['none', 'single', 'multiple'] as const

/** Режим выбора группы меток */
export type TagGroupSelectionMode = (typeof TAG_GROUP_SELECTION_MODES)[number]

/** Значение метки в группе */
export type TagValue = string | number

/** Метка группы */
export interface TagGroupItem {
	/** Значение: ключ метки и элемент `modelValue` */
	value: TagValue
	/** Текст метки */
	label: string
	/** Значок перед текстом (имя BaseIcon) */
	icon?: string
	/** Цвет роли метки вместо `tone` группы */
	tone?: TagTone
	/** Выключенная метка */
	isDisabled?: boolean
	/** Удаляемая метка вместо `isRemovable` группы */
	isRemovable?: boolean
}

/** Выбранные значения: значение или `null` при single, массив при multiple */
export type TagGroupModelValue = TagValue | TagValue[] | null

/**
 * Пропсы компонента BaseTagGroup
 */
export interface BaseTagGroupProps extends BaseComponentProps<(typeof TAG_VARIANTS)[number], 'root' | 'tag'> {
	/** Метки группы */
	items: TagGroupItem[]
	/** Выбранные значения (`v-model`): значение или `null` при single, массив при multiple */
	modelValue?: TagGroupModelValue
	/** Режим выбора: none, single, multiple */
	selectionMode?: TagGroupSelectionMode
	/** Все метки удаляемые: кнопка «Удалить метку …», Delete и Backspace — событие `remove` */
	isRemovable?: boolean
	/** Цвет роли всех меток (у метки можно задать свой `tone`) */
	tone?: TagTone
	/** Имя группы для скринридера (`aria-label`); по умолчанию «Метки» из словаря */
	label?: string
	/** Выключить все метки */
	isDisabled?: boolean
}

/**
 * События компонента BaseTagGroup
 */
export interface BaseTagGroupEmits {
	/** Новые выбранные значения (`v-model`) */
	(event: 'update:modelValue', value: TagGroupModelValue): void
	/**
	 * Удаление метки: кнопка «Удалить метку …» или Delete и Backspace. Метку из `items` убирает приложение;
	 * если оно сделало это сразу, фокус переходит на соседнюю метку (следующую, у последней — предыдущую)
	 */
	(event: 'remove', item: TagGroupItem, index: number): void
}

/**
 * Слоты компонента BaseTagGroup
 */
export interface BaseTagGroupSlots {
	/** Содержимое метки вместо текста; имя кнопки удаления остаётся по `label` метки */
	tag?: (props: { item: TagGroupItem; isSelected: boolean }) => unknown
}

export type TagGroupProps = PropsWithDefaults<BaseTagGroupProps, 'selectionMode' | 'isRemovable' | 'isDisabled'>

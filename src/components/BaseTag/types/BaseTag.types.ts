import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления метки: default — мягкий фон цвета роли, outline — рамка цвета роли на фоне страницы.
 * Выбранная метка в обоих вариантах залита цветом роли и показывает галочку.
 */
export const TAG_VARIANTS = ['default', 'outline'] as const

/**
 * Цвет роли метки — токены `--rise-{роль}-soft`, `-text`, `-border` и `--rise-{роль}` у выбранной;
 * neutral — нейтральные токены фона и текста, выбранная — основной цвет
 */
export const TAG_TONES = ['neutral', 'primary', 'info', 'success', 'warning', 'error'] as const

/** Цвет роли метки */
export type TagTone = (typeof TAG_TONES)[number]

/** Элементы метки для `customClass` */
type TagElement = 'root' | 'main' | 'icon' | 'text' | 'remove'

/**
 * Пропсы компонента BaseTag
 */
export interface BaseTagProps extends BaseComponentProps<(typeof TAG_VARIANTS)[number], TagElement> {
	/** Текст метки (заменяется слотом default); из него же — имя кнопки удаления «Удалить метку …» */
	label?: string
	/** Значок перед текстом (имя BaseIcon); у выбранной метки вместо него — галочка */
	icon?: string
	/** Цвет роли: neutral, primary, info, success, warning, error */
	tone?: TagTone
	/**
	 * Выбираемая метка: кнопка-переключатель с `aria-pressed`, Enter и Space меняют `isSelected`
	 * (`v-model:is-selected`)
	 */
	isSelectable?: boolean
	/** Метка выбрана (`v-model:is-selected`); учитывается только у выбираемой */
	isSelected?: boolean
	/**
	 * Удаляемая метка: кнопка «Удалить метку …» и клавиши Delete и Backspace на метке — событие `remove`.
	 * Сам кит метку не скрывает: её убирает приложение
	 */
	isRemovable?: boolean
	/** Имя кнопки удаления вместо «Удалить метку {label}» — когда текст метки задан слотом */
	removeLabel?: string
	/** Выключенная метка: не выбирается, не удаляется, без фокуса */
	isDisabled?: boolean
}

/**
 * События компонента BaseTag
 */
export interface BaseTagEmits {
	/** Новое значение выбора у выбираемой метки (`v-model:is-selected`) */
	(event: 'update:isSelected', value: boolean): void
	/** Удаление: кнопка «Удалить метку …» или Delete и Backspace на метке */
	(event: 'remove', e: MouseEvent | KeyboardEvent): void
	/**
	 * Клик по метке. С обработчиком невыбираемая метка работает как кнопка: `role="button"`, фокус с Tab,
	 * Enter и Space вызывают тот же `click`; у выбираемой приходит после `update:isSelected`
	 */
	(event: 'click', e: MouseEvent): void
}

/**
 * Слоты компонента BaseTag
 */
export interface BaseTagSlots {
	/** Содержимое вместо label */
	default?: () => unknown
	/** Значок вместо `icon` (у выбранной метки вместо него — галочка) */
	icon?: () => unknown
}

export type TagProps = PropsWithDefaults<BaseTagProps, 'tone' | 'isSelectable' | 'isSelected' | 'isRemovable' | 'isDisabled'>

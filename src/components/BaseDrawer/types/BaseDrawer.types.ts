import type { PropsWithDefaults } from '@composables/useDefaults'
import type { BaseComponentProps } from '@composables/useBaseComponent'

/** У панели одно оформление: фон и текст меняет `color` */
export const DRAWER_VARIANTS = ['default'] as const

/** Край окна, от которого выезжает панель */
export const DRAWER_DIRECTIONS = ['bottom', 'top', 'left', 'right'] as const

export type DrawerDirection = (typeof DRAWER_DIRECTIONS)[number]

/** `sizeScale` масштабирует отступы, кегль и ширину боковой панели; `color` задаёт фон и текст панели. */
export interface BaseDrawerProps extends BaseComponentProps<
	(typeof DRAWER_VARIANTS)[number],
	'root' | 'panel' | 'handle' | 'header' | 'title' | 'body' | 'footer'
> {
	/** Панель открыта (v-model:isOpen) */
	isOpen: boolean
	/** Заголовок — имя диалога */
	title?: string
	/** Описание под заголовком — описание диалога (`aria-describedby`) */
	description?: string
	/** Имя диалога без заголовка */
	ariaLabel?: string
	/** Край окна: `bottom` — нижний лист, `top`, `left`, `right` — боковая панель */
	direction?: DrawerDirection
	/** Полоска-ручка у края панели */
	hasHandle?: boolean
	/** Закрытие перетаскиванием за ручку или шапку к краю окна */
	isDraggable?: boolean
	/** Закрытие по клику на затемнение */
	closeOnOverlay?: boolean
	/** Закрытие по Escape */
	closeOnEscape?: boolean
	/** Затемнение за панелью */
	hasOverlay?: boolean
}

export interface BaseDrawerEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
}

export interface BaseDrawerSlots {
	/** Содержимое панели */
	default?: () => unknown
	/** Шапка вместо заголовка из `title` (кнопка «Закрыть» остаётся) */
	header?: () => unknown
	/** Подвал: кнопки действий */
	footer?: () => unknown
}

export type DrawerProps = PropsWithDefaults<BaseDrawerProps, 'closeOnOverlay' | 'closeOnEscape'>

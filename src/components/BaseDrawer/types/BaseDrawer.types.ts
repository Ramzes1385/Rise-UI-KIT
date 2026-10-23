import type { UiProp } from '@composables/base/useUi'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** У панели одно оформление: фон и текст меняет `color` */
export const DRAWER_VARIANTS = ['default'] as const

/** Край окна, от которого выезжает панель */
export const DRAWER_DIRECTIONS = ['bottom', 'top', 'left', 'right'] as const

export type DrawerDirection = (typeof DRAWER_DIRECTIONS)[number]

/**
 * Части шторки для пропа `ui`: root — затемнение, panel — панель, handle — ручка, header — шапка, title — заголовок,
 * close — кнопка «Закрыть», description — описание, body — содержимое, footer — подвал.
 */
export const DRAWER_PARTS = ['root', 'panel', 'handle', 'header', 'title', 'close', 'description', 'body', 'footer'] as const

export type BaseDrawerPart = (typeof DRAWER_PARTS)[number]

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
	/**
	 * Появление и уход панели: `slide` (по умолчанию) — въезд со своего края на всю высоту или ширину панели,
	 * `fade` — только прозрачность, `scale` — масштаб от своего края, `pop` — масштаб с пружиной, `none` — сразу.
	 * Длительности — токены движения и пресет `data-rise-motion`; при «уменьшить движение» — сразу.
	 * Глобально — `defaults.BaseDrawer.animation` или `defaults.global.animation`
	 */
	animation?: EnterAnimation
	/**
	 * Классы частей шторки: добавляются к БЭМ-классам кита, глобальные — `defaults.BaseDrawer.ui`.
	 *
	 * @example
	 * <BaseDrawer :ui="{ panel: 'rounded-none', footer: 'justify-between' }" />
	 */
	ui?: UiProp<BaseDrawerPart>
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

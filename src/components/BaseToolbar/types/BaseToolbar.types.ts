import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты панели: default — без фона и рамки; ghost — то же без внутреннего отступа; outline — рамка;
 * soft — мягкий фон bg-elevated
 */
export const TOOLBAR_VARIANTS = ['default', 'ghost', 'outline', 'soft'] as const

/** Части панели для пропа `ui`: своих БЭМ-элементов у панели нет — только `root` (элемент с `role="toolbar"`) */
export const TOOLBAR_PARTS = [] as const

export type BaseToolbarPart = (typeof TOOLBAR_PARTS)[number]

export interface BaseToolbarProps extends BaseComponentProps<(typeof TOOLBAR_VARIANTS)[number], 'root'> {
	/** Имя панели для скринридера, например «Форматирование» */
	ariaLabel?: string
	/** Направление: стрелки ←/→ для горизонтальной панели, ↑/↓ — для вертикальной */
	orientation?: 'horizontal' | 'vertical'
	/**
	 * Классы корня (`root`) — добавляются к классам кита; глобально — `defaults.BaseToolbar.ui` плагина
	 *
	 * @example
	 * <BaseToolbar aria-label="Форматирование" :ui="{ root: 'shadow-sm' }" />
	 */
	ui?: UiProp<BaseToolbarPart>
}

export interface BaseToolbarSlots {
	/** Кнопки, переключатели, меню, разделители (BaseSeparator) и поля */
	default?: () => unknown
}

import type { BaseComponentProps } from '@composables/useBaseComponent'

/**
 * Варианты панели: default — без фона и рамки; ghost — то же без внутреннего отступа; outline — рамка;
 * soft — мягкий фон bg-elevated
 */
export const TOOLBAR_VARIANTS = ['default', 'ghost', 'outline', 'soft'] as const

export interface BaseToolbarProps extends BaseComponentProps<(typeof TOOLBAR_VARIANTS)[number], 'root'> {
	/** Имя панели для скринридера, например «Форматирование» */
	ariaLabel?: string
	/** Направление: стрелки ←/→ для горизонтальной панели, ↑/↓ — для вертикальной */
	orientation?: 'horizontal' | 'vertical'
}

export interface BaseToolbarSlots {
	/** Кнопки, переключатели, меню, разделители (BaseSeparator) и поля */
	default?: () => unknown
}

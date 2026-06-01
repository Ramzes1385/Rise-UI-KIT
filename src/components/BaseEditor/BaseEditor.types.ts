import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

/** Варианты отображения редактора */
export const EDITOR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Формат текста
 */
export type EditorFormat = 'bold' | 'italic' | 'underline' | 'strike'

/**
 * Выравнивание текста
 */
export type EditorAlign = 'left' | 'center' | 'right' | 'justify'

/**
 * Уровень заголовка
 */
export type EditorHeading = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'

/**
 * Пропсы компонента BaseEditor
 */
export interface BaseEditorProps {
	/** Кастомные классы */
	customClass?: CustomClassProp
	/** HTML-содержимое */
	modelValue?: string
	/** Плейсхолдер */
	placeholder?: string
	/** Только чтение */
	isReadonly?: boolean
	/** Вариант отображения */
	variant?: (typeof EDITOR_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Показывать панель инструментов */
	hasToolbar?: boolean
	/** Автофокус */
	isAutofocus?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BaseEditor
 */
export interface BaseEditorEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'focus'): void
	(event: 'blur'): void
}

/**
 * Слоты компонента BaseEditor
 */
export interface BaseEditorSlots {
	toolbar?: () => unknown
}

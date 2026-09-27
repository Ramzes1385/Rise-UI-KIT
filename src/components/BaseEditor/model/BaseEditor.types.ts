import type { BaseComponentProps } from '../../../types/base.types'

/** Варианты отображения редактора */
export const EDITOR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Доля sizeScale редактора для контролов тулбара и меню медиа (селект «Формат», поля и кнопки меню):
 * размер sm — 28px при sizeScale = 100, как кнопки-иконки тулбара. Внутренняя константа, из пакета не экспортируется.
 */
export const EDITOR_MENU_SCALE_RATIO = 0.875

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
export interface BaseEditorProps extends BaseComponentProps<(typeof EDITOR_VARIANTS)[number], 'root' | 'toolbar' | 'btn' | 'group' | 'colorPicker' | 'headingSelect' | 'fileInput' | 'content' | 'code'> {
	/**
	 * HTML-содержимое.
	 * ВНИМАНИЕ: редактор не санитизирует HTML ни на входе, ни в `update:modelValue` — строка
	 * вставляется через innerHTML как есть (`<img onerror>`, `<svg onload>`, `<iframe srcdoc>`,
	 * `<style>` сработают и в режиме только для чтения). Недоверенный HTML санитизируйте на сервере
	 * (allowlist тегов/атрибутов, схемы ссылок) перед сохранением и перед передачей в редактор.
	 */
	modelValue?: string
	/** Плейсхолдер */
	placeholder?: string
	/** Только чтение */
	isReadonly?: boolean
	/** Показывать панель инструментов */
	hasToolbar?: boolean
	/** Автофокус */
	isAutofocus?: boolean
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

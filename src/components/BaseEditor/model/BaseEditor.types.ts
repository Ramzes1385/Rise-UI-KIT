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
	 * HTML-содержимое. Перед показом в редакторе и перед `update:modelValue` очищается функцией `sanitize`:
	 * по умолчанию удаляются скрипты, обработчики `on*`, ссылки `javascript:`, `<iframe>`, `<svg>`, `<style>`.
	 * Сохранённый HTML всё равно проверяйте на сервере: клиентскую очистку можно обойти, отправив запрос напрямую.
	 */
	modelValue?: string
	/**
	 * Очистка HTML: при показе `modelValue`, вставке из буфера обмена, перетаскивании, выходе из режима кода
	 * и в `update:modelValue`. По умолчанию — `sanitizeHtml` из `utils`: разрешённые элементы редактора,
	 * безопасные ссылки и медиа. Можно передать свою функцию, например DOMPurify со своими правилами.
	 * Отключить очистку можно функцией `html => html` — только для HTML из доверенного источника.
	 */
	sanitize?: (html: string) => string
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

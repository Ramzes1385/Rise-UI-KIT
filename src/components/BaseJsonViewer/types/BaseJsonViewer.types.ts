import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseJsonViewer: default — рамка на фоне страницы, soft — подложка `bg-muted` без рамки,
 * outline — рамка `border-accented`, ghost — без рамки и фона.
 */
export const JSON_VIEWER_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/** Типы значений JSON: от типа зависят цвет значения и сводка у объекта и массива */
export const JSON_VALUE_TYPES = ['object', 'array', 'string', 'number', 'boolean', 'null'] as const

/** Тип значения JSON */
export type JsonValueType = (typeof JSON_VALUE_TYPES)[number]

/** Узел дерева JSON для показа */
export interface JsonNodeView {
	/** Путь к значению: `$.user.name`, `$.items[0]`, `$["две части"]` — он же id узла */
	path: string
	/** Ключ объекта или индекс массива; у значения в корне — пустая строка */
	key: string
	/** Тип значения */
	type: JsonValueType
	/** Значение для показа: строка в кавычках, число, `true`, `null`; у объекта и массива — «3 ключа», «{}» */
	preview: string
}

/**
 * Пропсы компонента BaseJsonViewer
 */
export interface BaseJsonViewerProps extends BaseComponentProps<(typeof JSON_VIEWER_VARIANTS)[number], 'root' | 'toolbar' | 'tree'> {
	/** Данные: объект, массив или значение JSON. Значения вне JSON (undefined, функции) показываются как null */
	value: unknown
	/** Имя дерева для скринридера, например «Ответ сервера» */
	label: string
	/** Сколько уровней раскрыто при показе и смене value: 0 — всё свёрнуто, 1 — верхний уровень */
	expandDepth?: number
	/** Кнопки «Развернуть всё», «Свернуть всё» и «Копировать JSON» над деревом */
	hasToolbar?: boolean
}

/**
 * События компонента BaseJsonViewer
 */
export interface BaseJsonViewerEmits {
	/** JSON скопирован в буфер обмена кнопкой «Копировать JSON»: текст с отступом в два пробела */
	(event: 'copy', text: string): void
}

/**
 * Слоты компонента BaseJsonViewer
 */
export interface BaseJsonViewerSlots {
	/** Свои кнопки в панели над деревом, после «Копировать JSON» */
	actions?: () => unknown
}

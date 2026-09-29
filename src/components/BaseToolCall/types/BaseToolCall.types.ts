import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseToolCall: `default` — карточка в рамке, `soft` — на подложке,
 * `outline` — рамка без подложки у заголовка, `ghost` — строка без рамки и отступов
 */
export const TOOL_CALL_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/** Состояния вызова: ожидает подтверждения или очереди, выполняется, выполнен, завершился ошибкой */
export const TOOL_CALL_STATUSES = ['pending', 'running', 'success', 'error'] as const

/** Состояние вызова инструмента */
export type ToolCallStatus = (typeof TOOL_CALL_STATUSES)[number]

/**
 * Пропсы компонента BaseToolCall
 */
export interface BaseToolCallProps extends BaseComponentProps<(typeof TOOL_CALL_VARIANTS)[number], 'root' | 'trigger' | 'content'> {
	/** Имя инструмента, как его вызывает модель: `search_docs` */
	name: string
	/** Понятное название действия: «Поиск по документации»; без него в заголовке имя инструмента */
	title?: string
	/** Состояние вызова */
	status?: ToolCallStatus
	/** Параметры вызова: строка показывается как есть, остальное — JSON с отступами */
	args?: unknown
	/** Результат: строка как есть, остальное — JSON; свою разметку задаёт слот `output` */
	result?: unknown
	/** Текст ошибки при `status="error"` */
	error?: string
	/** Подробности раскрыты (`v-model:is-open`) */
	isOpen?: boolean
}

/**
 * События компонента BaseToolCall
 */
export interface BaseToolCallEmits {
	/** Подробности раскрыты или свёрнуты */
	(event: 'update:isOpen', value: boolean): void
}

/**
 * Слоты компонента BaseToolCall
 */
export interface BaseToolCallSlots {
	/** Своя разметка результата вместо JSON: таблица, карточки, ссылки */
	output?: (props: { result: unknown }) => unknown
	/** Дополнительное содержимое под результатом: кнопки «Разрешить» и «Отклонить» для `pending` */
	default?: () => unknown
}

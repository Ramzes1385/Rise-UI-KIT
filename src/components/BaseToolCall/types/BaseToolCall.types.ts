import type { UiProp } from '@composables/base/useUi'
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
 * Части вызова для пропа `ui` (БЭМ-элементы `.base-tool-call__<часть>`, `root` — сама карточка): trigger — заголовок-кнопка,
 * status — значок или индикатор состояния, title — название действия, name — имя инструмента, state — состояние словом,
 * arrow — шеврон, collapse — сворачиваемая область, content — подробности, code — блоки параметров и результата,
 * error — текст ошибки
 */
export const TOOL_CALL_PARTS = ['trigger', 'status', 'title', 'name', 'state', 'arrow', 'collapse', 'content', 'code', 'error'] as const

export type BaseToolCallPart = (typeof TOOL_CALL_PARTS)[number]

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
	/**
	 * Подробности раскрыты (`v-model:is-open`). Раскрываются и сворачиваются по высоте (строки сетки 0fr↔1fr) с проявлением,
	 * шеврон поворачивается; при выключенном движении — сразу
	 */
	isOpen?: boolean
	/**
	 * Классы частей вызова (`root`, `trigger`, `status`, `title`, `name`, `state`, `arrow`, `collapse`, `content`, `code`, `error`) —
	 * добавляются к классам кита. Глобально — `createUiKitPlugin({ defaults: { BaseToolCall: { ui } } })`, классы плагина
	 * и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseToolCall name="search_docs" :ui="{ root: 'shadow-sm', code: 'text-xs' }" />
	 */
	ui?: UiProp<BaseToolCallPart>
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

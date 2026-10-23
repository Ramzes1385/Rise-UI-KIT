import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseReasoning: `default` — заголовок-кнопка и текст с линией слева, `soft` — блок на подложке,
 * `outline` — блок в рамке, `ghost` — без линии и отступов
 */
export const REASONING_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Части блока для пропа `ui` (БЭМ-элементы `.base-reasoning__<часть>`, `root` — сам блок): trigger — заголовок-кнопка,
 * title — текст заголовка, arrow — шеврон, collapse — сворачиваемая область, content — текст рассуждений
 */
export const REASONING_PARTS = ['trigger', 'title', 'arrow', 'collapse', 'content'] as const

export type BaseReasoningPart = (typeof REASONING_PARTS)[number]

/**
 * Пропсы компонента BaseReasoning
 */
export interface BaseReasoningProps extends BaseComponentProps<(typeof REASONING_VARIANTS)[number], 'root' | 'trigger' | 'content'> {
	/** Ход рассуждений модели в Markdown (заменяется слотом default) */
	content?: string
	/** Модель ещё рассуждает: заголовок «Думает…» с переливом, курсор в конце текста */
	isStreaming?: boolean
	/** Сколько длились рассуждения, в секундах: «Думал 12 с». Без него время замеряется по `is-streaming` */
	duration?: number
	/**
	 * Блок раскрыт (`v-model:is-open`). Содержимое раскрывается и сворачивается по высоте (строки сетки 0fr↔1fr) с проявлением,
	 * шеврон поворачивается; при выключенном движении — сразу
	 */
	isOpen?: boolean
	/** Раскрывать блок на время рассуждений и сворачивать по их окончании, если пользователь его не трогал */
	hasAutoToggle?: boolean
	/** Свой заголовок вместо «Думает…», «Думал 12 с» и «Размышления»; разметку заголовка задаёт слот `title` */
	title?: string
	/**
	 * Классы частей блока (`root`, `trigger`, `title`, `arrow`, `collapse`, `content`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseReasoning: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseReasoning :content="text" :ui="{ trigger: 'uppercase', content: 'text-sm' }" />
	 */
	ui?: UiProp<BaseReasoningPart>
}

/**
 * События компонента BaseReasoning
 */
export interface BaseReasoningEmits {
	/** Блок раскрыт или свёрнут: пользователем или автоматически по `has-auto-toggle` */
	(event: 'update:isOpen', value: boolean): void
}

/**
 * Слоты компонента BaseReasoning
 */
export interface BaseReasoningSlots {
	/** Содержимое вместо `content` */
	default?: () => unknown
	/** Заголовок: `title` — готовая строка, `seconds` — длительность рассуждений или null */
	title?: (props: { title: string; seconds: number | null; isStreaming: boolean }) => unknown
}

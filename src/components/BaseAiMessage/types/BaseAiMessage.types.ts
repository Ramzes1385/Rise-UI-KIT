import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseAiMessage: `default` — ответ без пузыря, как в ИИ-чатах; `soft` — в пузыре на подложке;
 * `outline` — в рамке; `ghost` — без аватара и отступов (для встраивания)
 */
export const AI_MESSAGE_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Части сообщения для пропа `ui` (БЭМ-элементы `.base-ai-message__<часть>`, `root` — сама статья):
 * avatar — аватар или значок; body — колонка ответа (пузырь у `soft` и `outline`); header — строка имени и времени;
 * name — имя ассистента; time — время ответа; content — текст ответа (BaseMarkdown); error — блок ошибки с «Повторить»;
 * actions — строка действий под готовым ответом.
 */
export const AI_MESSAGE_PARTS = ['avatar', 'body', 'header', 'name', 'time', 'content', 'error', 'actions'] as const

export type BaseAiMessagePart = (typeof AI_MESSAGE_PARTS)[number]

/**
 * Пропсы компонента BaseAiMessage
 */
export interface BaseAiMessageProps extends BaseComponentProps<(typeof AI_MESSAGE_VARIANTS)[number], 'root' | 'body'> {
	/** Ответ в Markdown: рендерится BaseMarkdown безопасно, без HTML-строк */
	content?: string
	/**
	 * Идёт потоковый ответ: курсор в конце текста, `aria-busy`, действия скрыты. Когда ответ готов, действия появляются
	 * сдвигом и проявлением на токенах движения; при выключенном движении — сразу
	 */
	isStreaming?: boolean
	/** Ответ не получен: текст ошибки и кнопка «Повторить» (событие `retry`) */
	error?: string
	/** Имя ассистента над ответом; по умолчанию «Ассистент» */
	name?: string
	/** Аватар: адрес картинки; без него — значок */
	avatar?: string
	/** Время ответа рядом с именем: «12:04» */
	time?: string
	/** Кнопка «Копировать ответ» под готовым ответом */
	hasCopy?: boolean
	/**
	 * Классы частей сообщения (`root`, `avatar`, `body`, `header`, `name`, `time`, `content`, `error`, `actions`) —
	 * добавляются к классам кита. Глобально — `createUiKitPlugin({ defaults: { BaseAiMessage: { ui } } })`,
	 * классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseAiMessage content="Готово" :ui="{ body: 'shadow-sm', name: 'uppercase' }" />
	 */
	ui?: UiProp<BaseAiMessagePart>
}

/**
 * События компонента BaseAiMessage
 */
export interface BaseAiMessageEmits {
	/** «Повторить» после ошибки */
	(event: 'retry'): void
	/** Ответ скопирован кнопкой «Копировать ответ» */
	(event: 'copy', content: string): void
}

/**
 * Слоты компонента BaseAiMessage
 */
export interface BaseAiMessageSlots {
	/** Блоки перед ответом: рассуждение (BaseReasoning), вызовы инструментов (BaseToolCall) */
	default?: () => unknown
	/** Свои действия под ответом: оценка, «Сгенерировать заново» */
	actions?: () => unknown
}

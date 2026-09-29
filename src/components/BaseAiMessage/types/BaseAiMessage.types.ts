import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseAiMessage: `default` — ответ без пузыря, как в ИИ-чатах; `soft` — в пузыре на подложке;
 * `outline` — в рамке; `ghost` — без аватара и отступов (для встраивания)
 */
export const AI_MESSAGE_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Пропсы компонента BaseAiMessage
 */
export interface BaseAiMessageProps extends BaseComponentProps<(typeof AI_MESSAGE_VARIANTS)[number], 'root' | 'body'> {
	/** Ответ в Markdown: рендерится BaseMarkdown безопасно, без HTML-строк */
	content?: string
	/** Идёт потоковый ответ: курсор в конце текста, `aria-busy`, действия скрыты */
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

import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseMention: `default` — поле в рамке, `soft` — на подложке без рамки,
 * `outline` — рамка без фона, `ghost` — без рамки и фона
 */
export const MENTION_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/** Кого можно упомянуть: `value` вставляется после символа-триггера (`@anna`), `label` показывается в списке */
export interface MentionOption {
	value: string
	label: string
	description?: string
	avatar?: string
}

/** Упоминание, которое набирается сейчас: текст после триггера и его позиция в поле */
export interface MentionQuery {
	query: string
	start: number
	end: number
}

/**
 * Пропсы компонента BaseMention
 */
export interface BaseMentionProps extends BaseComponentProps<
	(typeof MENTION_VARIANTS)[number],
	'root' | 'label' | 'control' | 'list' | 'error'
> {
	/** Текст поля (v-model) */
	modelValue?: string
	/** Кого можно упомянуть; список фильтруется по набранному после триггера тексту */
	options?: readonly MentionOption[]
	/** Символ, после которого открывается список */
	trigger?: string
	/** Сколько вариантов показывать */
	maxSuggestions?: number
	/** Подпись поля, связанная с ним через for/id */
	label?: string
	/** Подсказка в пустом поле */
	placeholder?: string
	/** Высота поля в строках */
	rows?: number
	/** Текст ошибки: показывается под полем и связывается через aria-describedby */
	error?: string
	/** Отключает поле */
	isDisabled?: boolean
}

/**
 * События компонента BaseMention
 */
export interface BaseMentionEmits {
	/** Новый текст при вводе и после вставки упоминания */
	(event: 'update:modelValue', value: string): void
	/** Вставлено упоминание */
	(event: 'mention', option: MentionOption): void
	/** Изменился текст после триггера — для загрузки вариантов с сервера */
	(event: 'search', query: string): void
}

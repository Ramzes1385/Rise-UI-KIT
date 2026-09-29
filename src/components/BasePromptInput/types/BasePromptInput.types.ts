import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BasePromptInput: `default` — поле в рамке на фоне страницы, `soft` — на подложке без рамки,
 * `outline` — рамка без фона, `ghost` — без рамки и фона (для встраивания в свою панель)
 */
export const PROMPT_INPUT_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Пропсы компонента BasePromptInput
 */
export interface BasePromptInputProps extends BaseComponentProps<
	(typeof PROMPT_INPUT_VARIANTS)[number],
	'root' | 'label' | 'box' | 'control' | 'toolbar' | 'error'
> {
	/** Текст запроса (v-model); после отправки поле очищается */
	modelValue?: string
	/** Видимая подпись поля; без неё у поля доступное имя «Сообщение» */
	label?: string
	/** Подсказка в пустом поле; по умолчанию «Спросите что-нибудь…» */
	placeholder?: string
	/** Текст ошибки: под полем, связан через `aria-describedby` */
	error?: string
	/** Отключает поле и кнопки */
	isDisabled?: boolean
	/** Идёт ответ: вместо «Отправить» — «Остановить ответ» (событие `stop`), Enter не отправляет */
	isGenerating?: boolean
	/** Высота пустого поля в строках */
	rows?: number
	/** Поле растёт по тексту до этого числа строк, дальше прокручивается */
	maxRows?: number
	/** Ограничение длины запроса в символах */
	maxlength?: number
	/** Имя поля для отправки формы */
	name?: string
}

/**
 * События компонента BasePromptInput
 */
export interface BasePromptInputEmits {
	/** Новый текст при вводе и пустая строка после отправки */
	(event: 'update:modelValue', value: string): void
	/** Отправка: Enter (без Shift и вне набора через IME) или кнопка «Отправить»; пустой текст не отправляется */
	(event: 'submit', value: string): void
	/** «Остановить ответ» во время `is-generating` */
	(event: 'stop'): void
}

/**
 * Слоты компонента BasePromptInput
 */
export interface BasePromptInputSlots {
	/** Панель слева под полем: вложения, выбор модели */
	start?: () => unknown
	/** Панель справа перед кнопкой отправки: голосовой ввод, счётчик */
	end?: () => unknown
}

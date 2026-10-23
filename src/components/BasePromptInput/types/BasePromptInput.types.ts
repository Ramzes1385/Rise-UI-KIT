import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BasePromptInput: `default` — поле в рамке на фоне страницы, `soft` — на подложке без рамки,
 * `outline` — рамка без фона, `ghost` — без рамки и фона (для встраивания в свою панель)
 */
export const PROMPT_INPUT_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Части поля запроса для пропа `ui` (БЭМ-элементы `.base-prompt-input__<часть>`, `root` — обёртка компонента):
 * label — подпись, box — рамка с полем и панелью, control — `<textarea>`, toolbar — панель под полем,
 * start и end — левая и правая группы панели (слоты), action — место кнопки «Отправить» / «Остановить ответ»,
 * button — сама кнопка, error — текст ошибки.
 */
export const PROMPT_INPUT_PARTS = ['label', 'box', 'control', 'toolbar', 'start', 'end', 'action', 'button', 'error'] as const

export type BasePromptInputPart = (typeof PROMPT_INPUT_PARTS)[number]

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
	/**
	 * Идёт ответ: вместо «Отправить» — «Остановить ответ» (событие `stop`), Enter не отправляет.
	 * Кнопки сменяются перекрёстно — прозрачность и масштаб на токенах движения; при выключенном движении — сразу
	 */
	isGenerating?: boolean
	/** Высота пустого поля в строках */
	rows?: number
	/** Поле растёт по тексту до этого числа строк, дальше прокручивается */
	maxRows?: number
	/** Ограничение длины запроса в символах */
	maxlength?: number
	/** Имя поля для отправки формы */
	name?: string
	/**
	 * Классы частей поля (`root`, `box`, `control`, `toolbar`, `button`… — см. `PROMPT_INPUT_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BasePromptInput.ui` плагина, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BasePromptInput :ui="{ box: 'shadow-lg', control: 'font-mono' }" />
	 */
	ui?: UiProp<BasePromptInputPart>
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

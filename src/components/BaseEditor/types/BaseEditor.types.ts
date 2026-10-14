import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { EditorActiveStates } from '@composables/editor/useEditorToolbar'

export const EDITOR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части редактора для пропа `ui` (БЭМ-элементы `.base-editor__<часть>`, `root` — сам редактор): toolbar — панель инструментов,
 * group — группа кнопок панели, btn — кнопка панели (форматирование, ссылка, медиа, режим кода), content — область текста,
 * code — поле HTML-кода в режиме кода (BaseTextarea), context-menu — меню размера медиа,
 * frame — рамка с панелью и областью текста, label — заголовок поля, required — звёздочка обязательного поля, error-text — текст ошибки
 */
export const EDITOR_PARTS = [
	'toolbar',
	'group',
	'btn',
	'content',
	'code',
	'context-menu',
	'frame',
	'label',
	'required',
	'error-text',
] as const

export type BaseEditorPart = (typeof EDITOR_PARTS)[number]

export type EditorFormat = 'bold' | 'italic' | 'underline' | 'strike'

export type EditorAlign = 'left' | 'center' | 'right' | 'justify'

export type EditorHeading = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'

export interface BaseEditorProps extends BaseComponentProps<
	(typeof EDITOR_VARIANTS)[number],
	| 'root'
	| 'toolbar'
	| 'btn'
	| 'group'
	| 'colorPicker'
	| 'headingSelect'
	| 'fileInput'
	| 'content'
	| 'code'
	| 'label'
	| 'required'
	| 'errorText'
> {
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
	/** Только чтение: текст можно выделять и копировать, панель инструментов скрыта */
	isReadonly?: boolean
	/** Отключённое состояние: как у полей кита, текст не редактируется и не получает фокус. Отключённая BaseForm отключает и редактор */
	isDisabled?: boolean
	/** Заголовок поля: даёт области текста имя (`aria-labelledby`), клик по нему переводит фокус в редактор */
	label?: string
	/** Текст ошибки под редактором: рамка становится красной, область текста получает `aria-invalid` и `aria-describedby` */
	error?: string
	/**
	 * Поле обязательное: у области текста `aria-required`, у заголовка звёздочка. Пустой редактор (без текста и медиа)
	 * после ухода фокуса показывает ошибку «Обязательное поле»; `validate()` из `defineExpose` проверяет его вручную
	 */
	isRequired?: boolean
	/**
	 * Имя поля нативной формы: редактор добавляет скрытый `<input type="hidden">` с очищенным HTML (пустой редактор даёт пустую строку),
	 * поэтому значение попадает в `FormData` и отправку `<form>`. У отключённого редактора поле не отправляется
	 */
	name?: string
	/** Показывать панель инструментов */
	hasToolbar?: boolean
	/**
	 * Кнопки «Отменить» и «Повторить» в начале стандартной панели (подсказка с Ctrl/⌘+Z и Ctrl/⌘+Shift+Z): на сенсорном экране
	 * без клавиатуры отменить команду иначе нечем. Кнопка недоступна, пока нечего отменять или повторять, и в режиме кода (там своя история
	 * поля). `false` скрывает группу; свою панель (слот `toolbar`) это не затрагивает
	 */
	hasHistoryButtons?: boolean
	/** Автофокус */
	isAutofocus?: boolean
	/**
	 * Классы частей редактора (`root`, `frame`, `toolbar`, `group`, `btn`, `content`, `code`, `context-menu`, `label`, `required`, `error-text`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseEditor: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseEditor v-model="html" :ui="{ root: 'shadow-sm', content: 'prose' }" />
	 */
	ui?: UiProp<BaseEditorPart>
}

export interface BaseEditorEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'focus'): void
	(event: 'blur'): void
}

export interface BaseEditorSlots {
	/**
	 * Своя панель инструментов: заменяет стандартные кнопки. Значения слота — команды и состояние редактора
	 * (`applyFormat`, `insertHtml`, `activeStates`…); клики по панели не уводят выделение из текста
	 *
	 * @example
	 * <BaseEditor v-model="html"><template #toolbar="{ applyFormat, activeStates }">…</template></BaseEditor>
	 */
	toolbar?: (props: BaseEditorToolbarSlotProps) => unknown
}

export type EditorProps = PropsWithDefaults<
	BaseEditorProps,
	'modelValue' | 'isReadonly' | 'isDisabled' | 'isRequired' | 'isAutofocus' | 'sizeScale'
>

/** Значения слота `toolbar`: команды и состояние для собственных кнопок панели */
export interface BaseEditorToolbarSlotProps {
	/** Активные форматы под кареткой (`isBold`, `isItalic`, `isUnorderedList`…) и блок `formatBlock` */
	activeStates: EditorActiveStates
	/** Включён режим HTML-кода */
	isCodeMode: boolean
	/** Редактор только для чтения или отключён: команды ничего не меняют */
	isLocked: boolean
	/** Применить начертание или список: `bold`, `italic`, `underline`, `strikeThrough`, `justifyLeft`, `insertUnorderedList`… */
	applyFormat: (command: string) => void
	/** Сменить блок: `p`, `h1`–`h6`, `blockquote`, `pre` */
	applyBlock: (tag: string) => void
	/** Вставить HTML (очищается `sanitize`) в место выделения */
	insertHtml: (html: string) => void
	/** Открыть диалог ссылки */
	openLinkDialog: () => void
	/** Переключить режим кода */
	toggleCodeMode: () => void
	/** Вернуть фокус в область текста или поле кода */
	focus: () => void
	/** Отменить последнюю правку (Ctrl/⌘+Z); в режиме кода, чтения и у отключённого редактора ничего не делает */
	undo: () => void
	/** Повторить отменённую правку (Ctrl/⌘+Shift+Z, Ctrl+Y) */
	redo: () => void
	/** Есть что отменить */
	canUndo: boolean
	/** Есть что повторить */
	canRedo: boolean
}

/** Методы, доступные через `ref` на BaseEditor (`defineExpose`) */
export interface BaseEditorExpose {
	/** Область текста (`contenteditable`); в режиме кода — null */
	rootRef: HTMLDivElement | null
	/** Перевести фокус в область текста (в режиме кода — в поле кода) */
	focus: () => void
	/** Снять фокус с редактора */
	blur: () => void
	/** Текущий очищенный HTML (то же значение, что уходит в `update:modelValue`) */
	getHtml: () => string
	/** Вставить HTML (очищается `sanitize`) в место выделения или каретки; в режиме чтения ничего не делает */
	insertHtml: (html: string) => void
	/** Пуст ли редактор: нет текста и медиа */
	isEmpty: boolean
	/** Отменить последнюю правку (набор, команду, вставку); фокус переходит в область текста. В режиме кода, чтения и у отключённого редактора ничего не делает */
	undo: () => void
	/** Повторить отменённую правку */
	redo: () => void
	/** Есть что отменить */
	canUndo: boolean
	/** Есть что повторить */
	canRedo: boolean
	/** Проверить обязательность (`isRequired`) и показать ошибку; true — значение допустимо */
	validate: () => boolean
	/** Сбросить состояние «ушёл фокус»: ошибка обязательного поля скрывается */
	reset: () => void
}

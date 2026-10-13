import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const EDITOR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части редактора для пропа `ui` (БЭМ-элементы `.base-editor__<часть>`, `root` — сам редактор): toolbar — панель инструментов,
 * group — группа кнопок панели, btn — кнопка панели (форматирование, ссылка, медиа, режим кода), content — область текста,
 * code — поле HTML-кода в режиме кода (BaseTextarea), context-menu — меню размера медиа,
 * frame — рамка с панелью и областью текста, label — заголовок поля, error-text — текст ошибки
 */
export const EDITOR_PARTS = ['toolbar', 'group', 'btn', 'content', 'code', 'context-menu', 'frame', 'label', 'error-text'] as const

export type BaseEditorPart = (typeof EDITOR_PARTS)[number]

export type EditorFormat = 'bold' | 'italic' | 'underline' | 'strike'

export type EditorAlign = 'left' | 'center' | 'right' | 'justify'

export type EditorHeading = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'

export interface BaseEditorProps extends BaseComponentProps<
	(typeof EDITOR_VARIANTS)[number],
	'root' | 'toolbar' | 'btn' | 'group' | 'colorPicker' | 'headingSelect' | 'fileInput' | 'content' | 'code' | 'label' | 'errorText'
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
	/** Показывать панель инструментов */
	hasToolbar?: boolean
	/** Автофокус */
	isAutofocus?: boolean
	/**
	 * Классы частей редактора (`root`, `frame`, `toolbar`, `group`, `btn`, `content`, `code`, `context-menu`, `label`, `error-text`) — добавляются к классам кита.
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
	/** Свои кнопки в конце панели инструментов — после стандартных */
	toolbar?: () => unknown
}

export type EditorProps = PropsWithDefaults<BaseEditorProps, 'modelValue' | 'isReadonly' | 'isDisabled' | 'isAutofocus' | 'sizeScale'>

import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseMarkdown: `default` — текст на фоне страницы, `soft` — на приглушённой подложке,
 * `outline` — в рамке, `ghost` — без подложки и отступов (для встраивания в пузырь сообщения).
 */
export const MARKDOWN_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Части для пропа `ui` (БЭМ-элементы `.base-markdown__<часть>`, `root` — корень): heading, paragraph, quote, list, item,
 * check (флажок задачи), rule (линия), table-wrap, table, image; строчные — link, code, caret (курсор потока);
 * блок кода — code-block, code-header, code-lang, copy (кнопка «Копировать»), pre, token (подсвеченный фрагмент).
 */
export const MARKDOWN_PARTS = [
	'heading',
	'paragraph',
	'quote',
	'list',
	'item',
	'check',
	'rule',
	'table-wrap',
	'table',
	'image',
	'link',
	'code',
	'caret',
	'code-block',
	'code-header',
	'code-lang',
	'copy',
	'pre',
	'token',
] as const

export type BaseMarkdownPart = (typeof MARKDOWN_PARTS)[number]

/** Уровень заголовка */
export type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

/** Выравнивание столбца таблицы */
export type MarkdownAlign = 'left' | 'center' | 'right' | null

/** Строчный элемент: текст, выделение, код, ссылка, картинка, перенос строки или курсор потокового ответа */
export type MarkdownInline =
	| { type: 'text'; value: string }
	| { type: 'strong' | 'em' | 'del'; children: MarkdownInline[] }
	| { type: 'code'; value: string }
	| { type: 'link'; href: string; isExternal: boolean; children: MarkdownInline[] }
	| { type: 'image'; src: string; alt: string }
	| { type: 'br' }
	| { type: 'caret' }

/** Пункт списка; `checked` — флажок задачи (`- [x]`), null — обычный пункт; `inline` — пункт из одного абзаца */
export interface MarkdownListItem {
	checked: boolean | null
	inline: MarkdownInline[] | null
	children: MarkdownBlock[]
}

/** Маркер пункта списка: отступ, нумерация, начало текста пункта */
export interface MarkdownListMarker {
	indent: number
	ordered: boolean
	start: number
	offset: number
	text: string
}

/** Блок разметки */
export type MarkdownBlock =
	| { type: 'heading'; level: MarkdownHeadingLevel; children: MarkdownInline[] }
	| { type: 'paragraph'; children: MarkdownInline[] }
	| { type: 'blockquote'; children: MarkdownBlock[] }
	| { type: 'list'; ordered: boolean; start: number; items: MarkdownListItem[] }
	| { type: 'code'; lang: string; value: string; hasCaret: boolean }
	| { type: 'hr' }
	| { type: 'table'; align: MarkdownAlign[]; head: MarkdownInline[][]; rows: MarkdownInline[][][] }

/** Правило разбора блока: блок и номер строки после него или null, если строка ему не подходит */
export type MarkdownBlockRule = (lines: readonly string[], index: number) => { block: MarkdownBlock; next: number } | null

/** Правило разбора строчного элемента: элемент и позиция после него или null */
export type MarkdownInlineRule = (text: string, index: number) => { node: MarkdownInline; end: number } | null

/** Настройки строчного разбора */
export interface MarkdownInlineOptions {
	/** Одиночный перевод строки — перенос (`<br>`), а не пробел */
	hasLineBreaks: boolean
	/** Глубина вложенности выделений и ссылок; выставляет разбор, глубже предела — обычный текст */
	inlineDepth?: number
}

/** Настройки блочного разбора: строчные плюс глубина вложенности цитат и списков (глубже предела — обычный текст) */
export interface MarkdownBlockOptions extends MarkdownInlineOptions {
	/** Глубина вложенности цитат и списков; выставляет разбор */
	depth?: number
}

/** Пары парных знаков строки: индекс открывающего → индекс закрывающего */
export type MarkdownDelimiterPairs = ReadonlyMap<number, number>

/** Поиск пар квадратных и круглых скобок строки: таблицы считаются один раз на строку */
export interface MarkdownPairLookups {
	/** Пары `[`…`]` */
	brackets: (source: string) => MarkdownDelimiterPairs
	/** Пары `(`…`)` */
	parens: (source: string) => MarkdownDelimiterPairs
}

/**
 * Пропсы компонента BaseMarkdown
 */
export interface BaseMarkdownProps extends BaseComponentProps<(typeof MARKDOWN_VARIANTS)[number], 'root'> {
	/**
	 * Текст в Markdown (CommonMark и GFM): заголовки, абзацы, выделение, зачёркивание, код, блоки кода, цитаты,
	 * списки и задачи, таблицы, ссылки, картинки, линии. HTML-теги не исполняются и выводятся как текст
	 */
	source?: string
	/** Идёт потоковый ответ: в конце текста мигает курсор, незакрытый блок кода показывается до конца */
	isStreaming?: boolean
	/** Одиночный перевод строки — перенос строки, как в чатах; false — пробел, как в CommonMark */
	hasLineBreaks?: boolean
	/**
	 * Классы частей (`root`, `heading`, `paragraph`, `link`, `code`, `code-block`, `pre`, `quote`, `table`… — список в
	 * `MARKDOWN_PARTS`) — добавляются к классам кита. Глобально — `createUiKitPlugin({ defaults: { BaseMarkdown: { ui } } })`,
	 * классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseMarkdown :source="text" :ui="{ heading: 'tracking-tight', link: 'font-medium' }" />
	 */
	ui?: UiProp<BaseMarkdownPart>
}

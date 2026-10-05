import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseTextDiff: default — рамка на фоне страницы, soft — подложка `bg-muted` без рамки,
 * outline — рамка `border-accented`, ghost — без рамки и фона.
 */
export const TEXT_DIFF_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Части сравнения текстов для пропа `ui` (БЭМ-элементы `.base-text-diff__<часть>`, `root` — сам блок `<figure>`):
 * summary — сводка над таблицей; count — счётчики «+3» и «−3»; same — надпись «Без изменений»; table — таблица строк;
 * head — скрытая шапка таблицы в виде `unified`; row — строка таблицы; number — номер строки; sign — знак «+» или «−»
 * в виде `unified`; text — текст строки; word — изменённое слово (`<ins>`, `<del>`).
 */
export const TEXT_DIFF_PARTS = ['summary', 'count', 'same', 'table', 'head', 'row', 'number', 'sign', 'text', 'word'] as const

/** Часть сравнения текстов для пропа `ui` */
export type BaseTextDiffPart = (typeof TEXT_DIFF_PARTS)[number]

/** Вид сравнения: одной колонкой, как `git diff`, или «было» и «стало» рядом */
export const TEXT_DIFF_MODES = ['unified', 'split'] as const

/** Вид сравнения */
export type TextDiffMode = (typeof TEXT_DIFF_MODES)[number]

/** Что случилось со строкой или её частью */
export type TextDiffChange = 'equal' | 'added' | 'removed'

/** Часть строки: слова без изменений, добавленные или удалённые */
export interface TextDiffPart {
	/** Текст части с пробелами */
	text: string
	/** Изменение части */
	type: TextDiffChange
}

/** Строка сравнения */
export interface TextDiffLine {
	/** Строка без изменений, добавлена или удалена */
	type: TextDiffChange
	/** Номер строки в тексте «было»; у добавленной строки его нет */
	before?: number
	/** Номер строки в тексте «стало»; у удалённой строки его нет */
	after?: number
	/** Части строки: у пары «удалено — добавлено» изменённые слова выделены отдельно */
	parts: TextDiffPart[]
}

/** Ряд в виде `split`: строка «было» слева и «стало» справа */
export interface TextDiffRow {
	/** Строка «было»; у добавленной строки слева пусто */
	left?: TextDiffLine
	/** Строка «стало»; у удалённой строки справа пусто */
	right?: TextDiffLine
}

/**
 * Пропсы компонента BaseTextDiff
 */
export interface BaseTextDiffProps extends BaseComponentProps<(typeof TEXT_DIFF_VARIANTS)[number], 'root' | 'table'> {
	/** Исходный текст */
	before: string
	/** Новый текст */
	after: string
	/** Что сравнивается — имя для скринридера и начало сводки: «Договор, пункт 4» */
	label: string
	/** Вид: `unified` — одной колонкой (по умолчанию), `split` — рядом */
	mode?: TextDiffMode
	/** Заголовок колонки «было» в виде `split` */
	beforeLabel?: string
	/** Заголовок колонки «стало» в виде `split` */
	afterLabel?: string
	/** Выделять изменённые слова внутри пары «удалено — добавлено» */
	isWordDiff?: boolean
	/**
	 * Классы частей (`root`, `summary`, `table`, `row`, `number`, `text`, `word`…) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseTextDiff: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseTextDiff :before="a" :after="b" label="Договор" :ui="{ summary: 'my-diff-summary', word: 'my-diff-word' }" />
	 */
	ui?: UiProp<BaseTextDiffPart>
}

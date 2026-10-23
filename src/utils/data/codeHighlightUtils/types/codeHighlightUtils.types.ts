/** Языки, которые подсвечивает `highlightCode`; остальные показываются простым текстом */
export const CODE_LANGUAGES = ['javascript', 'typescript', 'json', 'html', 'vue', 'css', 'scss', 'bash', 'python'] as const

/** Язык подсветки */
export type CodeLanguage = (typeof CODE_LANGUAGES)[number]

/** Вид фрагмента кода — от него зависит цвет (токены `--rise-code-*`) */
export const CODE_TOKEN_TYPES = ['keyword', 'string', 'number', 'comment', 'function', 'tag', 'attribute', 'property', 'variable'] as const

/** Вид фрагмента кода */
export type CodeTokenType = (typeof CODE_TOKEN_TYPES)[number]

/** Фрагмент кода: текст и вид; `type: null` — обычный текст (пробелы, знаки, имена) */
export interface CodeToken {
	type: CodeTokenType | null
	value: string
}

/** Найденный фрагмент: вид и длина от текущей позиции */
export interface CodeMatch {
	type: CodeTokenType | null
	length: number
}

/** Правило разбора: фрагмент с позиции `index` или null, если правило не подходит */
export type CodeRule = (source: string, index: number) => CodeMatch | null

/** Разбор вложенного кода на другом языке: скрипт и стили внутри HTML, выражения шаблона Vue */
export type EmbedTokenizer = (source: string, language: CodeLanguage) => CodeToken[]

/** Состояние разбора HTML и Vue: текст, позиция, собранные фрагменты */
export interface MarkupState {
	source: string
	index: number
	tokens: CodeToken[]
	/** Разбирать выражения `{{ }}` и значения директив Vue */
	isVue: boolean
	embed: EmbedTokenizer
}

/** Открывающий тег: имя строчными и атрибуты (`lang`, `type` выбирают язык вложенного кода) */
export interface MarkupTag {
	name: string
	attributes: Record<string, string>
}

/**
 * Ближайшие справа границы для каждой позиции — один проход справа налево. Заменяет заглядывание вперёд в регулярках:
 * оно на каждом слове читало текст до `;`, `{` или `}`, и длинный участок без них разбирался за квадратичное время
 */
export interface StyleBounds {
	/** Позиция ближайшего `;`, `{` или `}` начиная с индекса; длина текста — такого нет */
	stop: Int32Array
	/** Позиция ближайшего `;`, `{`, `}`, `(` или `)` начиная с индекса */
	paren: Int32Array
}

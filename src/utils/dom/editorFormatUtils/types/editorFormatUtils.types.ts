/** Типы утилит оформления текста в редакторе через Selection и Range. */

/** Какой тег ставит команда начертания и какие теги считаются тем же начертанием */
export interface InlineFormatSpec {
	/** Тег, в который оборачивается текст (`b`, `i`, `u`, `s`) */
	tag: string
	/** Теги в верхнем регистре, которые уже означают это начертание (`B` и `STRONG`) */
	tags: readonly string[]
}

/** Выделение как отрезок текста области: число символов текстовых узлов до границ, не зависит от разметки */
export interface TextRange {
	start: number
	end: number
}

/** Атрибуты создаваемой ссылки */
export interface LinkAttributes {
	href: string
	target?: string
	rel?: string
}

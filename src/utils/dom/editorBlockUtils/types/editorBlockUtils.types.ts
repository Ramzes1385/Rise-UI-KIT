/** Типы утилит блоков, списков и выравнивания в редакторе через Selection и Range. */

/** Тег блока, в который команда «Формат» превращает абзацы */
export type EditorBlockTag = 'blockquote' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'pre'

/** Тип списка: маркированный или нумерованный */
export type EditorListTag = 'ol' | 'ul'

/** Выравнивание абзаца */
export type EditorAlign = 'center' | 'justify' | 'left' | 'right'

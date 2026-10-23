import type { MarkdownBlock, MarkdownInline } from './BaseMarkdown.types'

/** Блок кода с языком и кнопкой «Копировать» */
export interface MarkdownCodeProps {
	block: Extract<MarkdownBlock, { type: 'code' }>
}

/** Список блоков: рендерится рекурсивно — цитаты и пункты списка содержат свои блоки */
export interface MarkdownBlocksProps {
	blocks: readonly MarkdownBlock[]
}

/** Строчные элементы: рендерятся рекурсивно — выделение и ссылки содержат свои элементы */
export interface MarkdownInlineProps {
	nodes: readonly MarkdownInline[]
}

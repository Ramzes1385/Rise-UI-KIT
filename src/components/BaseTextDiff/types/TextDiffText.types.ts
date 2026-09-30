import type { TextDiffPart } from './BaseTextDiff.types'

/**
 * Пропсы текста строки BaseTextDiff
 */
export interface TextDiffTextProps {
	/** Части строки: изменённые слова выводятся в `<ins>` и `<del>` */
	parts: TextDiffPart[]
}

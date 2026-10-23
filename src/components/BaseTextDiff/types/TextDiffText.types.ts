import type { TextDiffPart } from './BaseTextDiff.types'

/**
 * Пропсы текста строки BaseTextDiff
 */
export interface TextDiffTextProps {
	/** Части строки: изменённые слова выводятся в `<ins>` и `<del>` */
	parts: TextDiffPart[]
	/** Классы изменённого слова: `base-text-diff__word` и классы части `word` из пропа `ui` родителя */
	wordClass: string
}

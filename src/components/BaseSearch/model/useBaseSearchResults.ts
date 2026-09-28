import type { SearchResult } from '../types/BaseSearch.types'
import type { BaseSearchResultsEmits, BaseSearchResultsProps, TextPart } from '../types/BaseSearchResults.types'

function splitTextByQuery(text: string, rawQuery: string): TextPart[] {
	const query = rawQuery.trim().toLowerCase()
	const lowerText = text.toLowerCase()
	if (!query || lowerText.length !== text.length) return [{ text, isMatch: false }]

	const parts: TextPart[] = []
	let from = 0
	for (let index = lowerText.indexOf(query); index !== -1; index = lowerText.indexOf(query, from)) {
		if (index > from) parts.push({ text: text.slice(from, index), isMatch: false })
		parts.push({ text: text.slice(index, index + query.length), isMatch: true })
		from = index + query.length
	}
	if (from < text.length) parts.push({ text: text.slice(from), isMatch: false })
	return parts
}

export function useBaseSearchResults(props: BaseSearchResultsProps, emit: BaseSearchResultsEmits) {
	return {
		splitByQuery: (text: string): TextPart[] => splitTextByQuery(text, props.query),
		handleSelect: (item: SearchResult): void => emit('select', item),
		handleHighlight: (index: number): void => emit('highlight', index),
	}
}

import type { SearchResult } from '../types/BaseSearch.types'
import { highlightSearchMatches } from '@utils/data/textUtils'
import type { BaseSearchResultsEmits, BaseSearchResultsProps, TextPart } from '../types/BaseSearchResults.types'

export function useBaseSearchResults(props: BaseSearchResultsProps, emit: BaseSearchResultsEmits) {
	return {
		splitByQuery: (text: string): TextPart[] => highlightSearchMatches(text, props.query.trim()),
		handleSelect: (item: SearchResult): void => emit('select', item),
		handleHighlight: (index: number): void => emit('highlight', index),
	}
}

import type { SearchResult, SearchVariant } from './BaseSearch.types'
import type { BaseComponentProps } from '@/types/base.types'

export interface BaseSearchOverlayProps extends BaseComponentProps<SearchVariant> {
	panel: 'modal' | 'sidebar'
	modelValue: string
	searchPlaceholder: string
	triggerPlaceholder: string
	variant: SearchVariant
	sizeScale: number
	isDisabled: boolean
	error: string
	hasIcon: boolean
	hasClear: boolean
	isLoading: boolean
	visibleResults: SearchResult[]
	highlightedIndex: number
	shouldShowResults: boolean
	classes: Record<string, string | undefined>
}

export interface BaseSearchOverlayEmits {
	'update:modelValue': [value: string]
	keydown: [event: KeyboardEvent]
	clear: []
	select: [item: SearchResult]
	highlight: [index: number]
	close: []
}

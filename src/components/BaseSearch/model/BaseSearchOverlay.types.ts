import type { SearchResult } from './BaseSearch.types'

export interface BaseSearchOverlayProps {
	panel: 'modal' | 'sidebar'
	modelValue: string
	searchPlaceholder: string
	triggerPlaceholder: string
	variant: string
	sizeScale: number
	isDisabled: boolean
	error: string
	hasIcon: boolean
	hasClear: boolean
	isLoading: boolean
	visibleResults: SearchResult[]
	highlightedIndex: number
	shouldShowResults: boolean
	classes: Record<string, string>
	color?: Record<string, unknown>
	customClass?: Record<string, string | undefined>
}

export interface BaseSearchOverlayEmits {
	'update:modelValue': [value: string]
	keydown: [event: KeyboardEvent]
	clear: []
	select: [item: SearchResult]
	highlight: [index: number]
	close: []
}

import type { SearchResult } from './BaseSearch.types'
import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

export interface BaseSearchOverlayProps {
	panel: 'modal' | 'sidebar'
	modelValue: string
	searchPlaceholder: string
	triggerPlaceholder: string
	variant: 'default' | 'ghost' | 'outline' | 'shadow' | 'soft' | 'filled' | 'underline'
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
	color?: CustomColor
	customClass?: CustomClassProp
}

export interface BaseSearchOverlayEmits {
	'update:modelValue': [value: string]
	keydown: [event: KeyboardEvent]
	clear: []
	select: [item: SearchResult]
	highlight: [index: number]
	close: []
}

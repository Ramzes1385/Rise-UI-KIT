import { computed } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { useSizeScale } from '@composables/useSizeScale'
import type { LoaderProps } from '../types/BaseLoader.types'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'

export function useBaseLoader(props: LoaderProps) {
	const resolvedLabel = computed((): string => props.label ?? UI_TEXT.LOADING)

	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'animation', 'spinner', 'label'] }),
		...useSizeScale({ getScale: () => props.sizeScale }),
		...useCustomColor({ getColor: () => props.color }),
		resolvedLabel,
		accessibleName: computed((): string => resolvedLabel.value.replace(/[.…\s]+$/, '') || UI_TEXT.LOADING_ARIA),
	}
}

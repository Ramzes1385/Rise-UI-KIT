import { computed } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import type { LoaderProps } from '../types/BaseLoader.types'
import { useSizeScale } from '@composables/base/useSizeScale'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useCustomColor } from '@composables/base/useCustomColor'

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

import { computed, useId } from 'vue'
import { useSizeScale } from '@composables/useSizeScale'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import type { SeparatorProps } from '../types/BaseSeparator.types'

export function useBaseSeparator(props: SeparatorProps) {
	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'line', 'content'] }),
		...useSizeScale({ getScale: () => props.sizeScale }),
		...useCustomColor({ getColor: () => props.color }),
		contentId: useId(),
		spacingStyle: computed(() =>
			props.spacing === undefined ? undefined : { '--sep-pad-y': `${props.spacing}px`, '--sep-pad-x': `${props.spacing * 2}px` },
		),
		thicknessStyle: computed(() => ({ '--sep-thickness': `${props.thickness}px` })),
	}
}

import { computed, useId } from 'vue'
import { useSizeScale } from '@composables/base/useSizeScale'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useCustomColor } from '@composables/base/useCustomColor'
import type { SeparatorProps } from '../types/BaseSeparator.types'
import { nonNegativeProp, positiveProp } from '@utils/form/numberPropUtils'

const COMPONENT = 'BaseSeparator'
const DEFAULT_THICKNESS = 1

function checkedSpacing(spacing: number | undefined): number | undefined {
	if (spacing === undefined) return undefined
	return nonNegativeProp({ component: COMPONENT, prop: 'spacing', value: spacing })
}

export function useBaseSeparator(props: SeparatorProps) {
	const spacing = computed((): number | undefined => checkedSpacing(props.spacing))
	const thickness = computed((): number =>
		positiveProp({ component: COMPONENT, prop: 'thickness', value: props.thickness ?? DEFAULT_THICKNESS, fallback: DEFAULT_THICKNESS }),
	)
	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'line', 'content'] }),
		...useSizeScale({ getScale: () => props.sizeScale }),
		...useCustomColor({ getColor: () => props.color }),
		contentId: useId(),
		spacingStyle: computed(() =>
			spacing.value === undefined ? undefined : { '--sep-pad-y': `${spacing.value}px`, '--sep-pad-x': `${spacing.value * 2}px` },
		),
		rootStyle: computed(() => ({
			'--sep-thickness': `${thickness.value}px`,
			...(spacing.value === undefined ? {} : { '--sep-spacing': `${spacing.value}px` }),
		})),
	}
}

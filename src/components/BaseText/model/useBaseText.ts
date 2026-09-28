/** Composable: логика BaseText — начертание и обрезка строк */
import { computed } from 'vue'
import { useSizeScale } from '@composables/useSizeScale'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import type { TextProps } from '../types/BaseText.types'

export function useBaseText(props: TextProps) {
	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root'] }),
		...useSizeScale({ getScale: () => props.sizeScale }),
		...useCustomColor({ getColor: () => props.color }),
		weightStyle: computed(() => ({ fontWeight: props.weight })),
		maxLinesStyle: computed(() =>
			props.truncate && props.maxLines > 1
				? { display: '-webkit-box', WebkitLineClamp: props.maxLines, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
				: {},
		),
		modifierClasses: computed(() => [
			{ 'base-text--nowrap': props.nowrap },
			{ 'base-text--truncate': props.truncate && props.maxLines <= 1 },
		]),
	}
}

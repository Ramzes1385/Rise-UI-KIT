import { computed } from 'vue'
import { TEXT_WEIGHT } from './textWeight'
import { useUi } from '@composables/base/useUi'
import type { TextProps } from '../types/BaseText.types'
import { useSizeScale } from '@composables/base/useSizeScale'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useCustomColor } from '@composables/base/useCustomColor'

export function useBaseText(props: TextProps) {
	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root'] }),
		...useSizeScale({ getScale: () => props.sizeScale }),
		...useCustomColor({ getColor: () => props.color }),
		ui: useUi(props, 'base-text'),
		weightStyle: computed(() => ({ fontWeight: props.weight === TEXT_WEIGHT.REGULAR ? 'var(--text-weight)' : props.weight })),
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

import { computed } from 'vue'
import { useUi } from '@composables/base/useUi'
import { responsiveVars } from './gridResponsive'
import type { GridProps } from '../types/BaseGrid.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

export function useBaseGrid(props: GridProps) {
	const standard = useStandardBaseComponent('base-grid', props, ['root'])
	return {
		...standard,
		ui: useUi(props, 'base-grid'),
		modifiers: computed(() => [`base-grid--gap-${props.gap}`, props.rowGap && `base-grid--row-gap-${props.rowGap}`]),
		rootStyle: computed(() => [standard.sizeScaleStyle.value, responsiveVars('base-grid-cols', props.cols)]),
	}
}

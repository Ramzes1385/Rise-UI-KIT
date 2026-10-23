import { computed } from 'vue'
import { useUi } from '@composables/base/useUi'
import { columnVars, responsiveVars } from './gridResponsive'
import type { BaseGridItemProps } from '../types/BaseGridItem.types'

export function useBaseGridItem(props: BaseGridItemProps) {
	return {
		ui: useUi(props, 'base-grid-item'),
		itemStyle: computed(() => ({
			...columnVars(props.span, props.offset),
			...responsiveVars('base-grid-item-order', props.order),
		})),
	}
}

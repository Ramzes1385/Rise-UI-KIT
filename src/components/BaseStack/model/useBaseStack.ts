import { computed } from 'vue'
import { useUi } from '@composables/base/useUi'
import type { StackProps } from '../types/BaseStack.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

export function useBaseStack(props: StackProps) {
	return {
		...useStandardBaseComponent('base-stack', props, ['root']),
		ui: useUi(props, 'base-stack'),
		modifiers: computed(() => [
			`base-stack--${props.direction}`,
			`base-stack--gap-${props.gap}`,
			`base-stack--align-${props.align}`,
			`base-stack--justify-${props.justify}`,
			{ 'base-stack--wrap': props.isWrap, 'base-stack--inline': props.isInline },
		]),
	}
}

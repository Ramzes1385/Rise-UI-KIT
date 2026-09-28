import type { BaseContainerProps } from '../types/BaseContainer.types'
/** Composable: логика BaseContainer — классы и размер */
import { useStandardBaseComponent } from '@composables/useBaseComponent'

export function useBaseContainer(props: BaseContainerProps) {
	return useStandardBaseComponent('base-container', props, ['root'])
}

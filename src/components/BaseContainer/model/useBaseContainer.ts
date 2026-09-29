import type { BaseContainerProps } from '../types/BaseContainer.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

export function useBaseContainer(props: BaseContainerProps) {
	return useStandardBaseComponent('base-container', props, ['root'])
}

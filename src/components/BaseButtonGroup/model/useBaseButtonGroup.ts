import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseButtonGroupProps } from '../types/BaseButtonGroup.types'

export function useBaseButtonGroup(props: BaseButtonGroupProps) {
	return useStandardBaseComponent('base-button-group', props, ['root'])
}

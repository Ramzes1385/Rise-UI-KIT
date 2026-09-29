import type { BaseButtonGroupProps } from '../types/BaseButtonGroup.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

export function useBaseButtonGroup(props: BaseButtonGroupProps) {
	return useStandardBaseComponent('base-button-group', props, ['root'])
}

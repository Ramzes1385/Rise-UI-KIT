import { useSideBarNavigation } from '@composables/useSideBarNavigation'
import type { BaseSideBarNavigationEmits, BaseSideBarNavigationProps } from '../types/BaseSideBar.types'

export function useBaseSideBarNavigation(props: BaseSideBarNavigationProps, emit: BaseSideBarNavigationEmits) {
	return useSideBarNavigation({ props, emit })
}

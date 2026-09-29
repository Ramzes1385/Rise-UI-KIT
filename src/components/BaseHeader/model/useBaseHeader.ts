import { UI_ARIA } from '@/locales/messages'
import { computed, ref, useSlots, watch } from 'vue'
import { useBreakpoint } from '@composables/app/useBreakpoint'
import type { BaseHeaderProps } from '../types/BaseHeader.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

export function useBaseHeader(props: BaseHeaderProps) {
	const slots = useSlots()
	const isMenuOpen = ref(false)
	const closeMenu = (): void => {
		isMenuOpen.value = false
	}

	const { isMobile } = useBreakpoint()
	watch(isMobile, value => {
		if (!value) closeMenu()
	})

	return {
		...useStandardBaseComponent('base-header', props, ['root', 'inner', 'title', 'toggle']),
		slots,
		hasMenu: computed(() => Boolean(slots.menu)),
		resolvedMenuLabel: computed(() => props.menuLabel ?? UI_ARIA.MENU),
		isMenuOpen,
		closeMenu,
		exposed: { openMenu: () => (isMenuOpen.value = true), closeMenu },
	}
}

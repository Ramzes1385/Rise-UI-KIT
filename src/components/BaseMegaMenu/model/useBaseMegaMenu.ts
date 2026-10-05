import { computed, ref } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useMegaMenuHover } from './useMegaMenuHover'
import { useMegaMenuState } from './useMegaMenuState'
import { getItemKey, hasPanel } from './megaMenuItems'
import { useMotion } from '@composables/app/useMotion'
import { calcIconScale } from '@utils/media/iconUtils'
import { useLayer } from '@composables/app/useLayerStack'
import { useMegaMenuKeyboard } from './useMegaMenuKeyboard'
import { useBreakpoint } from '@composables/app/useBreakpoint'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseMegaMenuEmits, MegaMenuItem, MegaMenuLink, MegaMenuProps } from '../types/BaseMegaMenu.types'

const MEGA_MENU_ELEMENTS = ['root', 'bar', 'list', 'trigger', 'panel', 'group', 'link', 'promo']

function useMobileMenu(props: MegaMenuProps) {
	const { isSmallerThan } = useBreakpoint()
	const isMobileOpen = ref(false)
	return {
		isMobileMode: computed(() => isSmallerThan(props.mobileBreakpoint)),
		isMobileOpen,
		toggleMobile(): void {
			isMobileOpen.value = !isMobileOpen.value
		},
	}
}

function useMenuLayer(rootRef: { value: HTMLElement | null }, state: ReturnType<typeof useMegaMenuState>, isActive: () => boolean) {
	function closeAndReturnFocus(): void {
		const item = state.openItem.value
		const hadFocus = Boolean(rootRef.value?.contains(document.activeElement))
		state.close()
		if (item && hadFocus) document.getElementById(state.triggerId(item))?.focus()
	}
	useLayer({ isActive, elements: () => [rootRef.value], onEscape: closeAndReturnFocus, onPointerDownOutside: () => state.close() })
	return {
		handleFocusOut(event: FocusEvent): void {
			const next = event.relatedTarget as Node | null
			if (next && !rootRef.value?.contains(next)) state.close()
		},
	}
}

export function useBaseMegaMenu(props: MegaMenuProps, emit: BaseMegaMenuEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const listRef = ref<HTMLElement | null>(null)
	const state = useMegaMenuState(props, emit)
	const mobile = useMobileMenu(props)
	const isHoverEnabled = (): boolean => props.trigger === 'hover' && !mobile.isMobileMode.value
	const hover = useMegaMenuHover(props, state, isHoverEnabled)
	const layer = useMenuLayer(rootRef, state, () => Boolean(state.openItem.value) || mobile.isMobileOpen.value)

	function select(link: MegaMenuLink | MegaMenuItem, event: MouseEvent): void {
		emit('select', link, event)
		hover.cancelHoverTimer()
		state.close()
		mobile.isMobileOpen.value = false
	}

	return {
		...useStandardBaseComponent('base-mega-menu', props, MEGA_MENU_ELEMENTS),
		ui: useUi(props, 'base-mega-menu'),
		isMotionReduced: useMotion(rootRef).isReduced,
		...state,
		...mobile,
		...hover,
		...layer,
		...useMegaMenuKeyboard(listRef, state),
		rootRef,
		listRef,
		navLabel: computed(() => props.ariaLabel || UI_ARIA.MEGA_MENU),
		mobileToggleLabel: UI_ARIA.MENU,
		getItemKey,
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
		hasPanel,
		hoverDelays: computed(() => (isHoverEnabled() ? { open: props.openDelay, close: props.closeDelay } : undefined)),
		select,
		handleTriggerClick(item: MegaMenuItem): void {
			hover.cancelHoverTimer()
			const isPinned = state.isOpen(item) && state.source.value === 'click'
			state.setOpen(isPinned ? undefined : getItemKey(item), 'click')
		},
	}
}

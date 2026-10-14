import { useUi } from '@composables/base/useUi'
import { computed, ref, useSlots, watch } from 'vue'
import { UI_ARIA, UI_TEXT } from '@/locales/messages'
import { SideBarPassthrough } from './SideBarPassthrough'
import { BaseSlideover } from '@components/BaseSlideover'
import { usePadding } from '@composables/base/usePadding'
import { useBreakpoint } from '@composables/app/useBreakpoint'
import { useLinkComponent } from '@composables/interaction/useLink'
import { useSideBarCollapseMotion } from './useSideBarCollapseMotion'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseSideBarEmits, SideBarItem, SideBarProps } from '../types/BaseSideBar.types'

const SIDEBAR_ELEMENTS = ['root', 'header', 'title', 'toggle', 'navigation', 'loading', 'body', 'footer', 'collapsed']

const SLIDEOVER_BASE_WIDTH = 420

function useSideBarMobile(props: SideBarProps, emit: BaseSideBarEmits) {
	const { isSmallerThan } = useBreakpoint()
	const isMobileMode = computed(() => props.mobileBreakpoint !== undefined && isSmallerThan(props.mobileBreakpoint))
	const setMobileOpen = (value: boolean): void => emit('update:isMobileOpen', value)

	return {
		isMobileMode,
		shellComponent: computed(() => (isMobileMode.value ? BaseSlideover : SideBarPassthrough)),
		shellProps: computed(() => {
			if (!isMobileMode.value) return {}
			return {
				isOpen: props.isMobileOpen === true,
				side: 'left',
				title: props.title || UI_ARIA.MENU,
				width: Math.round((props.width / SLIDEOVER_BASE_WIDTH) * 100),
				customClass: { body: 'base-side-bar__mobile-body' },
				sizeScale: props.sizeScale,
				'onUpdate:isOpen': setMobileOpen,
			}
		}),
		closeAfterNavigation(item: SideBarItem): void {
			const isDisclosure = Boolean(item.children?.length) && !item.to
			if (isMobileMode.value && props.isMobileOpen && !isDisclosure) setMobileOpen(false)
		},
	}
}

function useCollapsedState(props: SideBarProps, emit: BaseSideBarEmits) {
	const internalCollapsed = ref(false)
	const isCollapsedControlled = computed(() => props.isCollapsed !== undefined)
	const isCollapsedState = computed(() => (isCollapsedControlled.value ? props.isCollapsed === true : internalCollapsed.value))

	watch(
		() => props.isCollapsed,
		(collapsed: boolean | undefined) => {
			if (isCollapsedControlled.value) internalCollapsed.value = collapsed === true
		},
		{ immediate: true },
	)

	return {
		isCollapsedState,
		toggleLabel: computed(() => (isCollapsedState.value ? UI_TEXT.EXPAND : UI_TEXT.COLLAPSE)),
		handleToggle(): void {
			const newValue = !isCollapsedState.value
			if (!isCollapsedControlled.value) internalCollapsed.value = newValue
			emit('update:isCollapsed', newValue)
			if (newValue) emit('collapse')
			else emit('expand')
		},
	}
}

function useSideBarLayout(props: SideBarProps) {
	const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--sidebar-pad' })
	return {
		paddingStyle: computed(() => (props.padding === undefined ? undefined : paddingStyle.value)),
		widthStyle: computed(() => ({ '--sidebar-width': `${props.width}px` })),
		collapsedWidthStyle: computed(() => ({ '--sidebar-collapsed-width': `${props.collapsedWidth}px` })),
		gapStyle: computed(() => ({ '--sidebar-gap': `${props.gap}px` })),
	}
}

function useSideBarSections(props: SideBarProps, isMobileMode: { value: boolean }) {
	const slots = useSlots()
	const hasItems = computed(() => Boolean(props.items?.length))
	return {
		hasItems,
		navigationLabelText: computed(() => props.navigationLabel || props.title || UI_ARIA.SIDEBAR_NAVIGATION),
		hasHeader: computed(() => !isMobileMode.value && (Boolean(slots.header) || Boolean(props.title) || props.isCollapsible)),
		hasNavigation: computed(() => Boolean(slots.navigation) || hasItems.value),
		hasFooter: computed(() => Boolean(slots.footer)),
		hasBody: computed(() => Boolean(slots.default)),
		hasCollapsedContent: computed(() => Boolean(slots.collapsedContent)),
	}
}

export function useBaseSideBar(props: SideBarProps, emit: BaseSideBarEmits) {
	const collapsed = useCollapsedState(props, emit)
	const mobile = useSideBarMobile(props, emit)
	const appLinkComponent = useLinkComponent()
	const rootRef = ref<HTMLElement | null>(null)
	const isCollapsedState = computed(() => !mobile.isMobileMode.value && collapsed.isCollapsedState.value)

	return {
		rootRef,
		ui: useUi(props, 'base-side-bar'),
		resolvedLinkComponent: computed(() => props.linkComponent ?? appLinkComponent),
		...useStandardBaseComponent('base-side-bar', props, SIDEBAR_ELEMENTS),
		...useSideBarLayout(props),
		...collapsed,
		isCollapsedState,
		...useSideBarCollapseMotion(() => isCollapsedState.value, rootRef),
		...mobile,
		toggleIcon: 'menu',
		...useSideBarSections(props, mobile.isMobileMode),
		handleItemClick(item: SideBarItem, event: MouseEvent): void {
			emit('itemClick', item, event)
			mobile.closeAfterNavigation(item)
		},
	}
}

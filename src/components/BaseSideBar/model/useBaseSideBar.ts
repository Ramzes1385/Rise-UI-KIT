import { UI_TEXT } from '@/locales/messages'
import { usePadding } from '@composables/usePadding'
import { computed, ref, useSlots, watch } from 'vue'
import { useLinkComponent } from '@composables/useLink'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import type { BaseSideBarEmits, SideBarItem, SideBarProps } from '../types/BaseSideBar.types'

const SIDEBAR_ELEMENTS = ['root', 'header', 'title', 'toggle', 'navigation', 'loading', 'body', 'footer', 'collapsed']

function useCollapsedState(props: SideBarProps, emit: BaseSideBarEmits) {
	const { wasPropPassed } = useExplicitPropDetection()
	const internalCollapsed = ref(false)
	const isCollapsedControlled = computed(() => wasPropPassed('isCollapsed'))
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

function useSideBarSections(props: SideBarProps) {
	const slots = useSlots()
	const hasItems = computed(() => Boolean(props.items?.length))
	return {
		hasItems,
		hasHeader: computed(() => Boolean(slots.header) || Boolean(props.title) || props.isCollapsible),
		hasNavigation: computed(() => Boolean(slots.navigation) || hasItems.value),
		hasFooter: computed(() => Boolean(slots.footer)),
		hasBody: computed(() => Boolean(slots.default)),
		hasCollapsedContent: computed(() => Boolean(slots.collapsedContent)),
	}
}

export function useBaseSideBar(props: SideBarProps, emit: BaseSideBarEmits) {
	const collapsed = useCollapsedState(props, emit)
	const appLinkComponent = useLinkComponent()

	return {
		resolvedLinkComponent: computed(() => props.linkComponent ?? appLinkComponent),
		...useStandardBaseComponent('base-side-bar', props, SIDEBAR_ELEMENTS),
		...useSideBarLayout(props),
		...collapsed,
		toggleIcon: 'menu',
		...useSideBarSections(props),
		handleItemClick(item: SideBarItem, event: MouseEvent): void {
			emit('itemClick', item, event)
		},
	}
}

import { provide, shallowRef } from 'vue'
import { hasChildren } from '../megaMenuItems'
import { useHoverTimer } from '../useHoverTimer'
import { MEGA_MENU_CASCADE_KEY } from './cascadeItems'
import { useCascadeKeyboard } from './useCascadeKeyboard'
import { useCascadePlacement } from './useCascadePlacement'
import type { MegaMenuCascadeContext, MegaMenuLink, MegaMenuLinkEntry, MegaMenuPanelProps } from '../../types/BaseMegaMenu.types'

function useCascadePath() {
	const path = shallowRef<MegaMenuLink[]>([])
	const placement = useCascadePlacement()
	const timer = useHoverTimer()

	return {
		path,
		timer,
		isExpanded: (entry: MegaMenuLinkEntry): boolean => path.value[entry.depth] === entry.link,
		isBelow: (entry: MegaMenuLinkEntry): boolean => placement.isBelow(entry.depth),
		open(entry: MegaMenuLinkEntry): void {
			timer.clearTimer()
			path.value = [...path.value.slice(0, entry.depth), entry.link]
			placement.place(entry.depth, entry.subId)
		},
		closeFrom(depth: number): void {
			timer.clearTimer()
			path.value = path.value.slice(0, depth)
			placement.cut(depth)
		},
	}
}

export function useMegaMenuCascade(props: MegaMenuPanelProps, select: MegaMenuCascadeContext['select']): MegaMenuCascadeContext {
	const cascade = useCascadePath()
	const { path, timer, open, closeFrom, isExpanded } = cascade

	function handleEnter(entry: MegaMenuLinkEntry, event: PointerEvent): void {
		const delays = props.hoverDelays
		if (!delays || event.pointerType !== 'mouse') return
		if (isExpanded(entry)) return timer.clearTimer()
		const isParent = hasChildren(entry.link) && !entry.link.isDisabled
		const hasOpenSibling = path.value.length > entry.depth
		if (isParent && hasOpenSibling) return open(entry)
		if (isParent) return timer.later(() => open(entry), delays.open)
		if (hasOpenSibling) return timer.later(() => closeFrom(entry.depth), delays.close)
		timer.clearTimer()
	}

	const context: MegaMenuCascadeContext = {
		isExpanded,
		isBelow: cascade.isBelow,
		select,
		handleEnter,
		toggle: (entry: MegaMenuLinkEntry): void => (isExpanded(entry) ? closeFrom(entry.depth) : open(entry)),
		...useCascadeKeyboard(cascade),
	}
	provide(MEGA_MENU_CASCADE_KEY, context)
	return context
}

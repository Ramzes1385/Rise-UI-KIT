import { hasChildren } from '../megaMenuItems'
import { useHoverTimer } from '../useHoverTimer'
import { nextTick, provide, ref, shallowRef } from 'vue'
import { useCascadeKeyboard } from './useCascadeKeyboard'
import { MEGA_MENU_CASCADE_KEY, resolveFlip } from './cascadeItems'
import type { MegaMenuCascadeContext, MegaMenuLink, MegaMenuLinkEntry, MegaMenuPanelProps } from '../../types/BaseMegaMenu.types'

function useCascadePath() {
	const path = shallowRef<MegaMenuLink[]>([])
	const flips = ref<boolean[]>([])
	const timer = useHoverTimer()

	function place(entry: MegaMenuLinkEntry): void {
		const preferLeft = flips.value[entry.depth - 1] === true
		flips.value = [...flips.value.slice(0, entry.depth), preferLeft]
		void nextTick(() => {
			const element = document.getElementById(entry.subId)
			if (element) flips.value[entry.depth] = resolveFlip(element.getBoundingClientRect(), preferLeft, window.innerWidth)
		})
	}

	return {
		path,
		timer,
		isExpanded: (entry: MegaMenuLinkEntry): boolean => path.value[entry.depth] === entry.link,
		isFlipped: (entry: MegaMenuLinkEntry): boolean => flips.value[entry.depth] === true,
		open(entry: MegaMenuLinkEntry): void {
			timer.clearTimer()
			path.value = [...path.value.slice(0, entry.depth), entry.link]
			place(entry)
		},
		closeFrom(depth: number): void {
			timer.clearTimer()
			path.value = path.value.slice(0, depth)
			flips.value = flips.value.slice(0, depth)
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
		isFlipped: cascade.isFlipped,
		select,
		handleEnter,
		toggle: (entry: MegaMenuLinkEntry): void => (isExpanded(entry) ? closeFrom(entry.depth) : open(entry)),
		...useCascadeKeyboard(cascade),
	}
	provide(MEGA_MENU_CASCADE_KEY, context)
	return context
}

import { nextTick } from 'vue'
import { LEVEL_LINK_SELECTOR } from './cascadeItems'
import { resolveArrowKey } from '@utils/dom/directionUtils'
import { getFocusable, getNextIndex, hasChildren } from '../megaMenuItems'
import type { MegaMenuCascadeControls, MegaMenuLinkEntry } from '../../types/BaseMegaMenu.types'

const VERTICAL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'Home', 'End'])

function focusFirstChild(entry: MegaMenuLinkEntry): void {
	void nextTick(() => getFocusable(document.getElementById(entry.subId), LEVEL_LINK_SELECTOR)[0]?.focus())
}

function moveInLevel(event: KeyboardEvent): boolean {
	const current = event.currentTarget as HTMLElement
	const links = getFocusable(current.closest('ul'), LEVEL_LINK_SELECTOR)
	const next = getNextIndex(resolveArrowKey(event), links.indexOf(current), links.length)
	links[next]?.focus()
	return true
}

export function useCascadeKeyboard(controls: MegaMenuCascadeControls) {
	function closeLevel(entry: MegaMenuLinkEntry): boolean {
		controls.closeFrom(entry.depth - 1)
		document.getElementById(entry.parentId)?.focus()
		return true
	}

	function openLevel(entry: MegaMenuLinkEntry): boolean {
		controls.open(entry)
		focusFirstChild(entry)
		return true
	}

	function collapse(entry: MegaMenuLinkEntry): boolean {
		if (!controls.isExpanded(entry)) return false
		controls.closeFrom(entry.depth)
		return true
	}

	function run(entry: MegaMenuLinkEntry, event: KeyboardEvent): boolean {
		const isNested = entry.depth > 0
		const isParent = hasChildren(entry.link) && !entry.link.isDisabled
		const key = resolveArrowKey(event)
		if (key === 'ArrowRight') return isParent ? openLevel(entry) : isNested
		if (key === 'ArrowLeft') return isNested && closeLevel(entry)
		if (event.key === 'Escape') return isNested ? closeLevel(entry) : collapse(entry)
		return isNested && VERTICAL_KEYS.has(event.key) && moveInLevel(event)
	}

	return {
		handleKeydown(entry: MegaMenuLinkEntry, event: KeyboardEvent): void {
			if (!run(entry, event)) return
			event.preventDefault()
			event.stopPropagation()
		},
	}
}

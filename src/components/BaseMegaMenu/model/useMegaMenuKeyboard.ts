import { nextTick } from 'vue'
import type { Ref } from 'vue'
import type { useMegaMenuState } from './useMegaMenuState'
import type { MegaMenuItem } from '../types/BaseMegaMenu.types'
import { getFocusable, getItemKey, getNextIndex, hasPanel } from './megaMenuItems'

const TRIGGER_SELECTOR = '.base-mega-menu__trigger'
const PANEL_FOCUSABLE = 'a[href], button'
const PANEL_SECTION = '.base-mega-menu__group, .base-mega-menu__promo'

function focusPanelEdge(panelId: string, edge: 'first' | 'last'): void {
	void nextTick(() => {
		const links = getFocusable(document.getElementById(panelId), PANEL_FOCUSABLE)
		;(edge === 'first' ? links[0] : links.at(-1))?.focus()
	})
}

function focusAdjacentSection(panel: HTMLElement, target: HTMLElement, key: string): void {
	const sections = [...panel.querySelectorAll<HTMLElement>(PANEL_SECTION)]
	const current = sections.findIndex(section => section.contains(target))
	getFocusable(sections[getNextIndex(key, current, sections.length)], PANEL_FOCUSABLE)[0]?.focus()
}

export function useMegaMenuKeyboard(listRef: Ref<HTMLElement | null>, state: ReturnType<typeof useMegaMenuState>) {
	function moveBetweenTriggers(event: KeyboardEvent, items: MegaMenuItem[]): void {
		const triggers = getFocusable(listRef.value, TRIGGER_SELECTOR)
		const next = getNextIndex(event.key, triggers.indexOf(event.target as HTMLElement), triggers.length)
		if (next < 0) return
		event.preventDefault()
		triggers[next].focus()
		const item = items.find(entry => state.triggerId(entry) === triggers[next].id)
		if (state.openItem.value) state.setOpen(item && hasPanel(item) ? getItemKey(item) : undefined, 'click')
	}

	return {
		handleTriggerKeydown(event: KeyboardEvent, item: MegaMenuItem, items: MegaMenuItem[]): void {
			const edge = { ArrowDown: 'first', ArrowUp: 'last' }[event.key] as 'first' | 'last' | undefined
			if (edge && hasPanel(item)) {
				event.preventDefault()
				state.setOpen(getItemKey(item), 'click')
				focusPanelEdge(state.panelId(item), edge)
				return
			}
			moveBetweenTriggers(event, items)
		},
		handlePanelKeydown(event: KeyboardEvent): void {
			const panel = event.currentTarget as HTMLElement
			const target = event.target as HTMLElement
			if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
				event.preventDefault()
				focusAdjacentSection(panel, target, event.key)
				return
			}
			const links = getFocusable(panel, PANEL_FOCUSABLE)
			const next = getNextIndex(event.key, links.indexOf(target), links.length)
			if (next < 0) return
			event.preventDefault()
			links[next].focus()
		},
	}
}

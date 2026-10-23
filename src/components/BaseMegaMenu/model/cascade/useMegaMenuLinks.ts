import { computed, inject } from 'vue'
import { MEGA_MENU_CASCADE_KEY } from './cascadeItems'
import { getItemKey, hasChildren } from '../megaMenuItems'
import type { MegaMenuCascadeContext, MegaMenuLinkEntry, MegaMenuLinksProps } from '../../types/BaseMegaMenu.types'

export function useMegaMenuLinks(props: MegaMenuLinksProps) {
	const cascade = inject(MEGA_MENU_CASCADE_KEY) as MegaMenuCascadeContext
	return {
		...cascade,
		getItemKey,
		hasChildren,
		leafListeners: (entry: MegaMenuLinkEntry): Record<string, (event: KeyboardEvent) => void> =>
			entry.depth > 0 ? { keydown: (event: KeyboardEvent): void => cascade.handleKeydown(entry, event) } : {},
		entries: computed<MegaMenuLinkEntry[]>(() =>
			props.links.map((link, index) => {
				const id = `${props.parentId}-${index}`
				return { link, depth: props.depth, id, subId: `${id}-sub`, parentId: props.parentId }
			}),
		),
	}
}

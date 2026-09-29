import { computed, ref } from 'vue'
import { UI_PLAYER } from './messages'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'

const CONTEXT_CLASSES = {
	panel: 'base-media-player__context',
	item: 'base-media-player__context-item',
	separator: 'base-media-player__context-separator',
}

export function useMediaContextMenu(options: {
	isLoop: () => boolean
	setLoop: (isLoop: boolean) => void
	copyLink: () => void
	copyLinkAtTime: () => void
	openReport: () => void
	toggleStats: () => void
}) {
	const isContextMenuOpen = ref(false)
	return {
		isContextMenuOpen,
		contextClasses: CONTEXT_CLASSES,
		setContextMenuOpen(isOpen: boolean): void {
			isContextMenuOpen.value = isOpen
		},
		contextItems: computed<DropdownMenuItem[][]>(() => [
			[
				{ type: 'checkbox', label: UI_PLAYER.LOOP, isChecked: options.isLoop(), onUpdateChecked: options.setLoop },
				{ label: UI_PLAYER.COPY_LINK, icon: 'copy', onSelect: options.copyLink },
				{ label: UI_PLAYER.COPY_LINK_AT_TIME, icon: 'link', onSelect: options.copyLinkAtTime },
			],
			[
				{ label: UI_PLAYER.REPORT, icon: 'alert-triangle', onSelect: options.openReport },
				{ label: UI_PLAYER.STATS, icon: 'code', onSelect: options.toggleStats },
			],
		]),
	}
}

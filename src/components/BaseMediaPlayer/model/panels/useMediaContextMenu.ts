import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { UI_PLAYER } from '../messages'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'

const CONTEXT_CLASSES = {
	panel: 'base-media-player__context',
	item: 'base-media-player__context-item',
	separator: 'base-media-player__context-separator',
}

export function useMediaContextMenu(options: {
	isLoop: () => boolean
	setLoop: (isLoop: boolean) => void
	hasShare: () => boolean
	openShare: () => void
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
				...(options.hasShare() ? [{ label: UI_PLAYER.SHARE_MENU, icon: 'send', onSelect: options.openShare }] : []),
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

export function withFrameItems(
	items: Readonly<Ref<DropdownMenuItem[][]>>,
	frame: {
		rotationText: Readonly<Ref<string>>
		rotateFrame: () => void
		isAmbient: Readonly<Ref<boolean>>
		setAmbient: (isOn: boolean) => void
		isAudio: Readonly<Ref<boolean>>
	},
) {
	return computed<DropdownMenuItem[][]>(() => {
		if (frame.isAudio.value) return items.value
		const [first, ...rest] = items.value
		const frameItems: DropdownMenuItem[] = [
			{ label: UI_PLAYER.ROTATE, icon: 'rotate-right', shortcut: frame.rotationText.value, onSelect: frame.rotateFrame },
			{ type: 'checkbox', label: UI_PLAYER.AMBIENT, isChecked: frame.isAmbient.value, onUpdateChecked: frame.setAmbient },
		]
		return [first, frameItems, ...rest]
	})
}

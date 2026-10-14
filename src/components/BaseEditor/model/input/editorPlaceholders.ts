import { releasePlaceholders } from '@utils/dom/editorFormatUtils'

export function releaseIdlePlaceholders(root: HTMLElement | null): void {
	const selection = window.getSelection()
	if (root && selection?.isCollapsed) releasePlaceholders(root, selection.anchorNode)
}

export function releasePlaceholdersForClipboard(root: HTMLElement | null): void {
	if (root) releasePlaceholders(root)
}

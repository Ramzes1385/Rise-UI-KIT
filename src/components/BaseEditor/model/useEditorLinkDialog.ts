import type { ComputedRef, Ref } from 'vue'
import { UI_EDITOR } from '@/locales/messages'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import type { EditorLinkDialogState, EditorToolbar } from '../types/EditorLinkDialog.types'

function createLinkDialogState(): EditorLinkDialogState {
	return { isVisible: false, x: 0, y: 0, url: '', isNewTab: false, hasLink: false, error: '' }
}

export function isLinkHotkey(event: KeyboardEvent): boolean {
	return (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.code === 'KeyK'
}

function useLinkDialogFocus(dialog: EditorLinkDialogState, dialogRef: Ref<HTMLElement | null>, toolbar: EditorToolbar): void {
	watch(
		() => dialog.isVisible,
		isVisible => {
			if (isVisible) {
				nextTick(() => dialogRef.value?.querySelector('input')?.focus())
				return
			}
			if (!dialogRef.value?.contains(document.activeElement)) return
			if (toolbar.isCodeMode.value) toolbar.getCodeTextarea()?.focus()
			else toolbar.restoreSelection()
		},
	)
}

export function useEditorLinkDialog(toolbar: EditorToolbar, isLocked: ComputedRef<boolean>) {
	const linkDialog = reactive<EditorLinkDialogState>(createLinkDialogState())
	const linkDialogRef = ref<HTMLElement | null>(null)

	function openLinkDialog(): void {
		if (isLocked.value) return
		toolbar.saveSelection()
		const current = toolbar.readLink()
		Object.assign(linkDialog, {
			...toolbar.getLinkPoint(),
			url: current?.url ?? '',
			isNewTab: current?.isNewTab ?? false,
			hasLink: Boolean(current),
			error: '',
			isVisible: true,
		})
	}

	function closeLinkDialog(): void {
		linkDialog.isVisible = false
	}

	function applyLinkDialog(): void {
		const url = toolbar.resolveLinkUrl(linkDialog.url)
		if (!url) {
			linkDialog.error = UI_EDITOR.LINK_URL_INVALID
			return
		}
		closeLinkDialog()
		toolbar.applyLink({ url, isNewTab: linkDialog.isNewTab })
	}

	function removeLinkFromDialog(): void {
		closeLinkDialog()
		toolbar.removeLink()
	}

	function setLinkUrl(value: string | number): void {
		linkDialog.url = String(value)
		linkDialog.error = ''
	}

	watch(isLocked, isLockedNow => {
		if (isLockedNow) closeLinkDialog()
	})
	useLinkDialogFocus(linkDialog, linkDialogRef, toolbar)

	const linkDialogAnchor = computed(() => ({ x: linkDialog.x, y: linkDialog.y }))

	return {
		linkDialog,
		linkDialogRef,
		linkDialogAnchor,
		openLinkDialog,
		closeLinkDialog,
		applyLinkDialog,
		removeLinkFromDialog,
		setLinkUrl,
	}
}

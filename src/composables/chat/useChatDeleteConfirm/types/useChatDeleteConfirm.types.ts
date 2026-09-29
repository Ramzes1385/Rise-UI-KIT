import type { Ref } from 'vue'

export type UseChatDeleteConfirmOptions = {
	selectedMessageIds: Ref<string[]>
	onDelete: (ids: string[]) => void
	onForward: (ids: string[]) => void
}

export type UseChatDeleteConfirmReturn = {
	deleteConfirm: Ref<{ isOpen: boolean; ids: string[] }>
	deleteConfirmText: Ref<string>
	handleDeleteSelected: () => void
	handleDeleteSingle: (messageId: string) => void
	handleConfirmDelete: () => void
	handleCancelDelete: () => void
	handleForwardSelected: () => void
	handleCancelSelection: () => void
}

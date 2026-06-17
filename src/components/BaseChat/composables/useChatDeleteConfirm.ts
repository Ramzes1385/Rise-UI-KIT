import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { UI_CHAT_DELETE_MULTI_CONFIRM, UI_CHAT_DELETE_SINGLE_CONFIRM } from '@constants'

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

function useChatDeleteConfirm(options: UseChatDeleteConfirmOptions): UseChatDeleteConfirmReturn {
	const deleteConfirm = ref<{ isOpen: boolean; ids: string[] }>({ isOpen: false, ids: [] })

	const deleteConfirmText = computed((): string => {
		const count = deleteConfirm.value.ids.length
		if (count <= 1) return UI_CHAT_DELETE_SINGLE_CONFIRM
		return UI_CHAT_DELETE_MULTI_CONFIRM.replace('{count}', String(count))
	})

	function handleDeleteSelected(): void {
		if (options.selectedMessageIds.value.length === 0) return
		deleteConfirm.value = { isOpen: true, ids: [...options.selectedMessageIds.value] }
	}

	function handleDeleteSingle(messageId: string): void {
		deleteConfirm.value = { isOpen: true, ids: [messageId] }
	}

	function handleConfirmDelete(): void {
		const ids = deleteConfirm.value.ids
		/* istanbul ignore next — defensive: модалка открывается только при непустом ids */
		if (ids.length > 0) {
			options.onDelete(ids)
		}
		options.selectedMessageIds.value = []
		deleteConfirm.value = { isOpen: false, ids: [] }
	}

	function handleCancelDelete(): void {
		deleteConfirm.value = { isOpen: false, ids: [] }
	}

	function handleForwardSelected(): void {
		options.onForward([...options.selectedMessageIds.value])
		options.selectedMessageIds.value = []
	}

	function handleCancelSelection(): void {
		options.selectedMessageIds.value = []
	}

	return {
		deleteConfirm,
		deleteConfirmText,
		handleDeleteSelected,
		handleDeleteSingle,
		handleConfirmDelete,
		handleCancelDelete,
		handleForwardSelected,
		handleCancelSelection,
	}
}

export { useChatDeleteConfirm }

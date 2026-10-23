import { computed, ref } from 'vue'
import { UI_FILE_MANAGER } from '@/locales/messages'
import { useFileManagerState } from './state/useFileManagerState'
import { useFileManagerSelection } from './state/useFileManagerSelection'
import type { BaseFileManagerEmits, FileManagerProps } from '../types/BaseFileManager.types'
import type { FileManagerCore, FileManagerFocusRequest } from '../types/FileManagerInternal.types'

export function useFileManagerCore(props: FileManagerProps, emit: BaseFileManagerEmits): FileManagerCore {
	const state = useFileManagerState(props, emit)
	const selection = useFileManagerSelection(state.entries, state.selected, () => props.isLoading)
	const focusRequest = ref<FileManagerFocusRequest | null>(null)

	return {
		...state,
		props,
		emit,
		selection,
		focusRequest,
		rootName: computed(() => props.rootLabel || UI_FILE_MANAGER.ROOT),
		canNavigate: computed(() => !props.isDisabled),
		canOperate: computed(() => !props.isDisabled && !props.isReadonly && !props.isLoading && !props.error),
		requestFocus(id: string | null): void {
			focusRequest.value = { id }
		},
	}
}

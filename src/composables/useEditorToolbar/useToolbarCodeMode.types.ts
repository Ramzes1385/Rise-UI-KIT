import type { Ref } from 'vue'

export interface UseToolbarCodeModeOptions {
	editorRef: Ref<HTMLDivElement | null>
	codeTextareaRef: Ref<HTMLTextAreaElement | { textareaRef: HTMLTextAreaElement | null } | null>
	onInput: () => void
}

import type { Ref } from 'vue'

export interface UseToolbarCodeModeOptions {
	editorRef: Ref<HTMLDivElement | null>
	codeTextareaRef: Ref<HTMLTextAreaElement | { textareaRef: HTMLTextAreaElement | null } | null>
	onInput: () => void
	/** Очистка HTML при возврате из режима кода в визуальный режим. По умолчанию HTML не меняется */
	sanitize?: (html: string) => string
}

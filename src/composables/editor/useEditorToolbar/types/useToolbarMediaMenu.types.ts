import type { Ref } from 'vue'

export interface UseToolbarMediaMenuOptions {
	editorRef: Ref<HTMLDivElement | null>
	onInput: () => void
	/** Режим только для чтения: меню медиа не открывается, изменение и удаление медиа запрещены */
	isReadonly?: () => boolean
}

import type { Ref } from 'vue'

/** Опции реестра адресов `blob:` вставленных медиафайлов */
export interface UseToolbarMediaUrlsOptions {
	/** Область визуального режима: адрес, который в ней есть, ещё нужен */
	editorRef: Ref<HTMLDivElement | null>
	/** HTML режима кода: адрес, который в нём есть, ещё нужен */
	codeContent: Ref<string>
}

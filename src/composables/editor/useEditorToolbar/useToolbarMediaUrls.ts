/** Composable: адреса blob: вставленных медиафайлов — освобождаются, когда они больше не нужны */
import { onScopeDispose } from 'vue'
import type { UseToolbarMediaUrlsOptions } from './types/useToolbarMediaUrls.types'

/**
 * Реестр адресов `blob:`, созданных для вставленных файлов. Адрес освобождается (`URL.revokeObjectURL`) в двух
 * безопасных точках: при размонтировании — все, и при сбросе истории отмены — те, которых нет в текущем содержимом
 * (история очищена, вернуть их отменой уже нельзя). Пока история жива, адреса остаются: отмена вернёт медиа в документ.
 */
function useToolbarMediaUrls({ editorRef, codeContent }: UseToolbarMediaUrlsOptions) {
	const urls = new Set<string>()

	function create(file: Blob): string {
		const url = URL.createObjectURL(file)
		urls.add(url)
		return url
	}

	function release(url: string): void {
		URL.revokeObjectURL(url)
		urls.delete(url)
	}

	/** Освобождает адреса, которых нет ни в области, ни в коде: вызывается после сброса истории */
	function prune(): void {
		const content = `${editorRef.value?.innerHTML ?? ''}${codeContent.value}`
		for (const url of [...urls]) if (!content.includes(url)) release(url)
	}

	onScopeDispose(() => [...urls].forEach(release))

	return { create, prune }
}

export { useToolbarMediaUrls }

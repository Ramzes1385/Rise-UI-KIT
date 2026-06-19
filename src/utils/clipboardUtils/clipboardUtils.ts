/** Утилиты: работа с буфером обмена */

/** Скопировать текст в буфер обмена, если API доступно */
async function copyTextToClipboard(text: string): Promise<void> {
	if (typeof navigator === 'undefined' || !navigator.clipboard) {
		return
	}

	await navigator.clipboard.writeText(text)
}

export { copyTextToClipboard }

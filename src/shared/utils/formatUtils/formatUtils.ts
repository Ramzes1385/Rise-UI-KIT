/** Иконка статуса доставки сообщения */
function formatMessageStatus(status: string): string {
	const icons: Record<string, string> = {
		sent: '✓',
		delivered: '✓✓',
		read: '✓✓',
		error: '✗',
	}
	return icons[status] || ''
}

/** Форматировать URL для отображения (только hostname) */
function formatUrl(url: string): string {
	try {
		const parsed = new URL(url)
		return parsed.hostname
	} catch {
		return url
	}
}

/** Форматировать дату для popover-подсказки */
function formatDateLong(date: Date, locale: string): string {
	return date.toLocaleDateString(locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		weekday: 'long',
	})
}

/** Форматировать значение ячейки таблицы */
function formatCellValue(value: unknown, formatter?: (val: unknown) => string): string {
	if (formatter) return formatter(value)
	return String(value ?? '')
}

export { formatCellValue, formatDateLong, formatMessageStatus, formatUrl }

/** Утилиты: генерация уникальных идентификаторов (содержит недетерминизм — Date.now + Math.random) */

export function generateId(prefix = ''): string {
	const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
	return prefix ? `${prefix}_${id}` : id
}

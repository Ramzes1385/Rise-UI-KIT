/** Утилиты меню: группы пунктов и поиск пункта по первым буквам */

/**
 * Пункты меню группами. Плоский список — одна группа; пустой список — ни одной.
 *
 * @example
 * toMenuGroups([{ label: 'Копировать' }]) // [[{ label: 'Копировать' }]]
 */
function toMenuGroups<T extends object>(items: readonly T[] | readonly (readonly T[])[]): T[][] {
	if (items.length === 0) return []
	return Array.isArray(items[0]) ? (items as T[][]) : [items as T[]]
}

/**
 * Индекс пункта по набранным буквам — поиск по первой букве из паттерна APG Menu. Регистр не учитывается.
 * Одна буква (или та же буква несколько раз подряд) ищется после текущего пункта по кругу: повтор перебирает
 * пункты на эту букву. Несколько разных букв ищутся начиная с текущего пункта: ввод уточняет совпадение.
 * Возвращает -1, если совпадений нет.
 *
 * @example
 * findTypeaheadIndex(['Копировать', 'Вставить', 'Выделить всё'], 'в', 1) // 2
 */
function findTypeaheadIndex(labels: readonly string[], query: string, currentIndex: number): number {
	const normalized = query.toLocaleLowerCase()
	const isSameChar = [...normalized].every(char => char === normalized[0])
	const search = isSameChar ? normalized[0] : normalized
	const start = isSameChar ? currentIndex + 1 : Math.max(currentIndex, 0)
	for (let offset = 0; offset < labels.length; offset++) {
		const index = (start + offset) % labels.length
		if (labels[index].toLocaleLowerCase().startsWith(search)) return index
	}
	return -1
}

export { findTypeaheadIndex, toMenuGroups }

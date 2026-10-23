/**
 * Параметры `docs` для оверлея, открытого при монтировании: на странице Docs история рисуется в рамке (`iframe`) заданной высоты,
 * иначе окно или панель перекрыли бы соседние истории. Использование: `docs: { ...docsFrame(240), description, source }`.
 */
export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

import { useImageMapHistory } from '../../model/document/useImageMapHistory'

function edit(history: ReturnType<typeof useImageMapHistory>, change: [string, string, string?]): boolean {
	const [before, after, mergeKey] = change
	history.begin(before)
	return history.commit(after, mergeKey)
}

describe('useImageMapHistory', () => {
	it('commit без begin и без изменений — false', () => {
		const history = useImageMapHistory(() => 10)
		expect(history.commit('a')).toBe(false)
		history.begin('a')
		expect(history.commit('a')).toBe(false)
		expect(history.canUndo.value).toBe(false)
	})

	it('commit после begin сбрасывает начало', () => {
		const history = useImageMapHistory(() => 10)
		expect(edit(history, ['a', 'b'])).toBe(true)
		expect(history.commit('c')).toBe(false)
	})

	it('каждая правка — шаг истории', () => {
		const history = useImageMapHistory(() => 10)
		edit(history, ['a', 'b'])
		edit(history, ['b', 'c'])
		expect(history.canUndo.value).toBe(true)
		expect(history.canRedo.value).toBe(false)
		expect(history.undo('c')).toBe('b')
		expect(history.undo('b')).toBe('a')
		expect(history.undo('a')).toBeUndefined()
	})

	it('правки с одним mergeKey подряд склеиваются, другой ключ — новый шаг', () => {
		const history = useImageMapHistory(() => 10)
		edit(history, ['a', 'b', 'title'])
		edit(history, ['b', 'c', 'title'])
		edit(history, ['c', 'd', 'label'])
		expect(history.undo('d')).toBe('c')
		expect(history.undo('c')).toBe('a')
		expect(history.canUndo.value).toBe(false)
	})

	it('undo и redo возвращают снимки', () => {
		const history = useImageMapHistory(() => 10)
		edit(history, ['a', 'b'])
		expect(history.undo('b')).toBe('a')
		expect(history.canRedo.value).toBe(true)
		expect(history.redo('a')).toBe('b')
		expect(history.canRedo.value).toBe(false)
		expect(history.undo('b')).toBe('a')
	})

	it('после undo тот же mergeKey даёт новый шаг', () => {
		const history = useImageMapHistory(() => 10)
		edit(history, ['a', 'b', 'title'])
		edit(history, ['b', 'c', 'title'])
		history.undo('c')
		history.redo('a')
		edit(history, ['c', 'd', 'title'])
		expect(history.undo('d')).toBe('c')
		expect(history.undo('c')).toBe('a')
	})

	it('после undo тот же mergeKey без redo тоже даёт новый шаг', () => {
		const history = useImageMapHistory(() => 10)
		edit(history, ['a', 'b', 'title'])
		edit(history, ['b', 'c', 'title'])
		edit(history, ['c', 'd', 'other'])
		history.undo('d')
		edit(history, ['c', 'e', 'other'])
		expect(history.undo('e')).toBe('c')
		expect(history.undo('c')).toBe('a')
	})

	it('новая правка очищает redo', () => {
		const history = useImageMapHistory(() => 10)
		edit(history, ['a', 'b'])
		history.undo('b')
		edit(history, ['a', 'x'])
		expect(history.canRedo.value).toBe(false)
		expect(history.redo('x')).toBeUndefined()
	})

	it('лимит ограничивает число шагов', () => {
		const history = useImageMapHistory(() => 2)
		edit(history, ['a', 'b'])
		edit(history, ['b', 'c'])
		edit(history, ['c', 'd'])
		expect(history.undo('d')).toBe('c')
		expect(history.undo('c')).toBe('b')
		expect(history.undo('b')).toBeUndefined()
	})

	it('лимит 0 — помнится один шаг', () => {
		const history = useImageMapHistory(() => 0)
		edit(history, ['a', 'b'])
		edit(history, ['b', 'c'])
		expect(history.undo('c')).toBe('b')
		expect(history.canUndo.value).toBe(false)
	})

	it('undo и redo на пустом стеке — undefined', () => {
		const history = useImageMapHistory(() => 10)
		expect(history.undo('a')).toBeUndefined()
		expect(history.redo('a')).toBeUndefined()
	})

	it('clear очищает стеки, начало и склейку', () => {
		const history = useImageMapHistory(() => 10)
		edit(history, ['a', 'b', 'title'])
		edit(history, ['b', 'c'])
		history.undo('c')
		history.begin('x')
		history.clear()
		expect(history.canUndo.value).toBe(false)
		expect(history.canRedo.value).toBe(false)
		expect(history.commit('y')).toBe(false)
		edit(history, ['c', 'd', 'title'])
		expect(history.undo('d')).toBe('c')
	})
})

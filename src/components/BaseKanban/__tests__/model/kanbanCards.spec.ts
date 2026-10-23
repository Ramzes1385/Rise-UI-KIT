import { appendCard, columnCards, locateCard, mergeDisplayed, moveCard, neighborCard, resolveMove } from '../../model/board/kanbanCards'

const CARDS = [
	{ id: 'a', columnId: 'x', title: 'A' },
	{ id: 'b', columnId: 'y', title: 'B' },
	{ id: 'c', columnId: 'x', title: 'C' },
]

describe('перемещение карточек', () => {
	it('moveCard: перед карточкой, в конец колонки, в пустую колонку; неизвестная — без изменений', () => {
		expect(moveCard(CARDS, 'c', { columnId: 'x', index: 0 }).map(card => card.id)).toEqual(['c', 'a', 'b'])
		expect(moveCard(CARDS, 'a', { columnId: 'y', index: 5 }).map(card => `${card.id}${card.columnId}`)).toEqual(['by', 'ay', 'cx'])
		expect(moveCard(CARDS, 'b', { columnId: 'z', index: 0 }).map(card => `${card.id}${card.columnId}`)).toEqual(['ax', 'cx', 'bz'])
		expect(moveCard(CARDS, 'нет', { columnId: 'x', index: 0 })).toEqual(CARDS)
	})

	it('locateCard и columnCards', () => {
		expect(locateCard(CARDS, 'c')).toEqual({ columnId: 'x', index: 1 })
		expect(locateCard(CARDS, 'нет')).toBeNull()
		expect(columnCards(CARDS, 'x').map(card => card.id)).toEqual(['a', 'c'])
	})

	it('appendCard — в конец своей колонки, neighborCard — следующая или предыдущая в колонке', () => {
		expect(appendCard(CARDS, { id: 'n', columnId: 'x', title: 'N' }).map(card => card.id)).toEqual(['a', 'b', 'c', 'n'])
		expect(appendCard(CARDS, { id: 'n', columnId: 'y', title: 'N' }).map(card => card.id)).toEqual(['a', 'b', 'n', 'c'])
		expect(neighborCard(CARDS, 'a')?.id).toBe('c')
		expect(neighborCard(CARDS, 'c')?.id).toBe('a')
		expect(neighborCard(CARDS, 'b')).toBeUndefined()
	})

	it('mergeDisplayed: место среди показанных соседей переносится в полный список', () => {
		const full = [...CARDS, { id: 'h', columnId: 'y', title: 'H' }]
		const shown = [
			{ id: 'b', columnId: 'y', title: 'B' },
			{ id: 'c', columnId: 'y', title: 'C' },
		]
		expect(mergeDisplayed(full, shown, 'c').map(card => `${card.id}${card.columnId}`)).toEqual(['ax', 'by', 'cy', 'hy'])
		expect(mergeDisplayed(full, [{ ...CARDS[0], columnId: 'z' }], 'a').map(card => `${card.id}${card.columnId}`)).toEqual([
			'by',
			'cx',
			'hy',
			'az',
		])
		expect(mergeDisplayed(full, [CARDS[1], { ...CARDS[0], columnId: 'y' }], 'a').map(card => card.id)).toEqual(['b', 'a', 'c', 'h'])
	})

	it('resolveMove: без смены места — next null и to = from', () => {
		expect(resolveMove(CARDS, CARDS, { cardId: 'c', origin: { columnId: 'x', index: 1 } })).toEqual({
			next: null,
			move: { card: CARDS[2], from: { columnId: 'x', index: 1 }, to: { columnId: 'x', index: 1 } },
		})
	})
})

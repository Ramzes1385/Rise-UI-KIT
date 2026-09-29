import { columnCards, locateCard, moveCard } from '../../model/board/kanbanCards'

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
})

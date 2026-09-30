import { countComments } from '../../model/thread/commentTree'

const author = { name: 'Анна' }

describe('дерево комментариев', () => {
	it('считает комментарии вместе с ответами всех уровней', () => {
		expect(countComments([])).toBe(0)
		expect(
			countComments([
				{
					id: 'a',
					author,
					text: 'a',
					date: 0,
					replies: [{ id: 'b', author, text: 'b', date: 0, replies: [{ id: 'c', author, text: 'c', date: 0 }] }],
				},
				{ id: 'd', author, text: 'd', date: 0 },
			]),
		).toBe(4)
	})
})

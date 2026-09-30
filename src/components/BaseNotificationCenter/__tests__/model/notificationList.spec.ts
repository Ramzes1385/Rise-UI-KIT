import { changedIds, unreadCount, visibleItems, withRead } from '../../model/list/notificationList'

const ITEMS = [
	{ id: 'a', title: 'A', date: 0 },
	{ id: 'b', title: 'B', date: 0, isRead: true },
	{ id: 'c', title: 'C', date: 0, isRead: false },
]

describe('список уведомлений', () => {
	it('считает непрочитанные и фильтрует', () => {
		expect(unreadCount(ITEMS)).toBe(2)
		expect(visibleItems(ITEMS, 'unread').map(item => item.id)).toEqual(['a', 'c'])
		expect(visibleItems(ITEMS, 'all')).toEqual(ITEMS)
		expect(visibleItems(ITEMS, 'all')).not.toBe(ITEMS)
	})

	it('меняются только уведомления с другой отметкой', () => {
		expect(changedIds(ITEMS, ['a', 'b', 'x'], true)).toEqual(['a'])
		expect(changedIds(ITEMS, ['a', 'b'], false)).toEqual(['b'])
	})

	it('новая отметка — новые объекты только у изменённых', () => {
		const next = withRead(ITEMS, ['a'], true)
		expect(next[0]).toEqual({ id: 'a', title: 'A', date: 0, isRead: true })
		expect(next[1]).toBe(ITEMS[1])
	})
})

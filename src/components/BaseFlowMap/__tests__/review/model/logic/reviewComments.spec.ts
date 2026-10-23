import type { ReviewThreadLike } from '../../../../types/internal/review/reviewCore.types'
import {
	addComment,
	commentCount,
	countUnread,
	createThread,
	latestComment,
	markThreadRead,
	setThreadResolved,
	visibleThreads,
} from '../../../../model/review/data/reviewComments'

const author = { name: 'Анна' }
const input = (text: string, date = 1) => ({ author, text, date })

interface Thread extends ReviewThreadLike {
	point?: { x: number; y: number }
}

describe('createThread', () => {
	it('создаёт цепочку с одним комментарием, обрезает пробелы, цепочка прочитана', () => {
		const [thread] = createThread<Thread>([], { target: { entity: 'node', id: 'a' } }, input('  Привет  '))
		expect(thread).toMatchObject({ id: 't1', isUnread: false, target: { entity: 'node', id: 'a' } })
		expect(thread.comments).toEqual([{ id: 'c1', author, text: 'Привет', date: 1 }])
	})

	it('id не повторяются с уже занятыми цепочками и комментариями', () => {
		const first = createThread<Thread>([], {}, input('один'))
		const second = createThread<Thread>(first, { point: { x: 1, y: 2 } }, input('два'))
		expect(second.map(item => item.id)).toEqual(['t1', 't3'])
		expect(second[1].comments[0].id).toBe('c3')
	})

	it('пропускает занятые номера', () => {
		const busy: Thread[] = [{ id: 't3', comments: [{ id: 'c3', author, text: 'x', date: 1 }] }]
		const next = createThread<Thread>(busy, {}, input('y'))
		expect(next[1].id).toBe('t4')
		expect(next[1].comments[0].id).toBe('c4')
	})
})

describe('addComment', () => {
	const base = (): Thread[] => createThread<Thread>([], {}, input('корень'))

	it('ответ в цепочку добавляется в конец и открывает решённую цепочку заново', () => {
		const resolved = setThreadResolved(base(), 't1', true)
		const next = addComment(resolved, { threadId: 't1' }, input('ответ', 2))
		expect(next[0].comments.map(item => item.text)).toEqual(['корень', 'ответ'])
		expect(next[0].isResolved).toBe(false)
	})

	it('вложенный ответ попадает в replies нужного комментария, на любой глубине', () => {
		let threads = addComment(base(), { threadId: 't1', parentId: 'c1' }, input('первый уровень'))
		threads = addComment(threads, { threadId: 't1', parentId: threads[0].comments[0].replies?.[0].id }, input('второй уровень'))
		const root = threads[0].comments[0]
		expect(root.replies?.[0].text).toBe('первый уровень')
		expect(root.replies?.[0].replies?.[0].text).toBe('второй уровень')
		expect(commentCount(threads[0].comments)).toBe(3)
	})

	it('другие комментарии и цепочки не меняются', () => {
		const two = createThread<Thread>(base(), {}, input('вторая'))
		const next = addComment(two, { threadId: 't1', parentId: 'c1' }, input('ответ'))
		expect(next[1]).toBe(two[1])
	})

	it('комментарий без replies другой ветки остаётся на месте', () => {
		let threads = addComment(base(), { threadId: 't1' }, input('второй корневой'))
		threads = addComment(threads, { threadId: 't1', parentId: 'c1' }, input('ответ'))
		expect(threads[0].comments[1].replies).toBeUndefined()
	})
})

describe('решено, прочитано, счётчики', () => {
	const list = (): Thread[] => {
		const first = createThread<Thread>([], {}, input('один'))
		return createThread<Thread>(first, {}, input('два'))
	}

	it('решить и вернуть', () => {
		const solved = setThreadResolved(list(), 't1', true)
		expect(solved.map(item => item.isResolved)).toEqual([true, undefined])
		expect(setThreadResolved(solved, 't1', false)[0].isResolved).toBe(false)
	})

	it('непрочитанные считаются без решённых', () => {
		const threads = list().map(item => ({ ...item, isUnread: true }))
		expect(countUnread(threads)).toBe(2)
		expect(countUnread(setThreadResolved(threads, 't1', true))).toBe(1)
		expect(countUnread(markThreadRead(threads, 't3'))).toBe(1)
	})

	it('прочитать — только указанную цепочку', () => {
		const threads = list().map(item => ({ ...item, isUnread: true }))
		const next = markThreadRead(threads, 't1')
		expect(next.map(item => item.isUnread)).toEqual([false, true])
	})

	it('видимые: решённые прячутся, пока их показ выключен; копия списка', () => {
		const solved = setThreadResolved(list(), 't1', true)
		expect(visibleThreads(solved, false).map(item => item.id)).toEqual(['t3'])
		const all = visibleThreads(solved, true)
		expect(all).toHaveLength(2)
		expect(all).not.toBe(solved)
	})

	it('последний комментарий и пустая цепочка', () => {
		const threads = addComment(createThread<Thread>([], {}, input('один')), { threadId: 't1' }, input('два'))
		const thread = threads[0]
		expect(latestComment(thread)?.text).toBe('два')
		expect(latestComment({ id: 'x', comments: [] })).toBeUndefined()
	})
})

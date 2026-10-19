import { vi } from 'vitest'
import { formatMessage } from '@/locales/state'
import { effectScope, nextTick, ref } from 'vue'
import { UI_ROADMAP_REVIEW } from '@/locales/messages'
import { editData } from '../edit/fixtures/editFixtures'
import { useRoadmapReview } from '../../model/review/useRoadmapReview'
import { nextRoadmapReviewId } from '../../model/review/format/roadmapReviewIds'
import type { RoadmapChange, RoadmapReviewData } from '../../types/roadmapEdit.types'

const rename = (id: string, title: string, previous: string): RoadmapChange => ({
	type: 'update',
	entity: 'topic',
	id,
	patch: { title },
	previous: { title: previous },
})

const USER: RoadmapReviewData = { currentUser: { name: 'Роман' } }

function setup(initial: RoadmapReviewData = USER, apply: (...args: never[]) => unknown = () => true) {
	const review = ref<RoadmapReviewData | undefined>(initial)
	const data = ref(editData())
	const emitReview = vi.fn((value: RoadmapReviewData) => (review.value = value))
	const announce = vi.fn()
	const applySpy = vi.fn(apply)
	let tick = 1000
	const scope = effectScope()
	const state = scope.run(() =>
		useRoadmapReview({
			data: () => data.value,
			review: () => review.value,
			emitReview,
			apply: applySpy as never,
			announce,
			now: () => (tick += 1000),
		}),
	)!
	return { state, review, data, emitReview, announce, apply: applySpy, scope }
}

describe('useRoadmapReview: предложения', () => {
	it('propose создаёт открытое предложение с автором, id p1…, и объявляет отправку', () => {
		const { state, emitReview, announce } = setup()
		const proposal = state.propose([rename('a', 'Новая', 'Тема a')], 'Переименовать')
		expect(proposal).toMatchObject({ id: 'p1', status: 'open', label: 'Переименовать', author: { name: 'Роман' }, date: 2000 })
		expect(emitReview).toHaveBeenCalledWith(expect.objectContaining({ proposals: [proposal] }))
		expect(announce).toHaveBeenCalledWith(formatMessage(UI_ROADMAP_REVIEW.ANNOUNCE_SENT, { label: 'Переименовать' }))
		expect(state.openCount.value).toBe(1)
		expect(state.proposals.value).toHaveLength(1)
		expect(state.propose([rename('b', 'Н', 'Тема b')])?.id).toBe('p2')
	})

	it('propose без изменений — null; без текущего пользователя автор «гость»; заголовок собирается из изменений', () => {
		const { state, announce } = setup({})
		expect(state.propose([])).toBeNull()
		expect(state.propose([rename('a', 'Новая', 'Тема a')])?.author.name).toBe(UI_ROADMAP_REVIEW.AUTHOR_GUEST)
		expect(announce.mock.calls[0][0]).toContain('Тема a')
	})

	it('accept применяет изменения один раз с подписью и помечает принятым', async () => {
		const { state, apply, announce } = setup()
		state.propose([rename('a', 'Новая', 'Тема a')], 'Переименовать')
		expect(await state.accept('p1')).toBe(true)
		expect(apply).toHaveBeenCalledOnce()
		expect(apply).toHaveBeenCalledWith([rename('a', 'Новая', 'Тема a')], 'Переименовать')
		expect(state.proposals.value[0].status).toBe('accepted')
		expect(announce).toHaveBeenLastCalledWith(formatMessage(UI_ROADMAP_REVIEW.ANNOUNCE_ACCEPTED, { label: 'Переименовать' }))
		expect(await state.accept('p1')).toBe(false)
		expect(apply).toHaveBeenCalledOnce()
	})

	it('accept: неизвестное, устаревшее и отклонённое применением (false) остаются открытыми', async () => {
		const { state, apply, data } = setup(USER, () => false)
		state.propose([rename('a', 'Новая', 'Тема a')], 'Один')
		expect(await state.accept('нет')).toBe(false)
		expect(await state.accept('p1')).toBe(false)
		expect(apply).toHaveBeenCalledOnce()
		expect(state.proposals.value[0].status).toBe('open')
		data.value = {
			...data.value,
			stages: data.value.stages.map(item => ({
				...item,
				topics: item.topics.map(topic => (topic.id === 'a' ? { ...topic, title: 'Чужая' } : topic)),
			})),
		}
		expect(await state.accept('p1')).toBe(false)
		expect(apply).toHaveBeenCalledOnce()
		expect(state.views.value[0].view.isStale).toBe(true)
		expect(state.readyCount.value).toBe(0)
	})

	it('apply без ответа (undefined) считается успехом', async () => {
		const { state } = setup(USER, () => undefined)
		state.propose([rename('a', 'Новая', 'Тема a')])
		expect(await state.accept('p1')).toBe(true)
	})

	it('decline отклоняет открытое один раз и объявляет', () => {
		const { state, announce } = setup()
		state.propose([rename('a', 'Новая', 'Тема a')], 'Ля')
		state.decline('нет')
		state.decline('p1')
		expect(state.proposals.value[0].status).toBe('rejected')
		expect(announce).toHaveBeenLastCalledWith(formatMessage(UI_ROADMAP_REVIEW.ANNOUNCE_DECLINED, { label: 'Ля' }))
		const calls = announce.mock.calls.length
		state.decline('p1')
		expect(announce.mock.calls).toHaveLength(calls)
	})

	it('acceptAll принимает только готовые и возвращает их число', async () => {
		const { state, data } = setup()
		state.propose([rename('a', 'A1', 'Тема a')])
		state.propose([rename('b', 'B1', 'Тема b')])
		state.propose([rename('c', 'C1', 'Тема c')])
		data.value = {
			...data.value,
			stages: data.value.stages.map(item => ({
				...item,
				topics: item.topics.map(topic => (topic.id === 'c' ? { ...topic, title: 'Иначе' } : topic)),
			})),
		}
		expect(state.readyCount.value).toBe(2)
		expect(await state.acceptAll()).toBe(2)
		expect(state.proposals.value.map(item => item.status)).toEqual(['accepted', 'accepted', 'open'])
		expect(await state.acceptAll()).toBe(0)
	})

	it('views сортируются от новых к старым и фильтруются по show', () => {
		const { state } = setup()
		state.propose([rename('a', 'A1', 'Тема a')])
		state.propose([rename('b', 'B1', 'Тема b')])
		expect(state.views.value.map(item => item.proposal.id)).toEqual(['p2', 'p1'])
		state.decline('p2')
		state.show.value = 'open'
		expect(state.views.value.map(item => item.proposal.id)).toEqual(['p1'])
		state.show.value = 'mine'
		expect(state.views.value).toHaveLength(2)
		expect(state.views.value[0].view.isStale).toBe(false)
	})

	it('смена пропса review подхватывается', async () => {
		const { state, review } = setup()
		review.value = { proposals: [{ id: 'x', author: { name: 'Кто-то' }, date: 1, changes: [], status: 'open' }] }
		await nextTick()
		expect(state.proposals.value.map(item => item.id)).toEqual(['x'])
		expect(state.currentUser.value).toBeUndefined()
	})
})

describe('useRoadmapReview: комментарии', () => {
	const target = { entity: 'topic', id: 'a' } as const

	it('startThread: пустой текст — null; иначе цепочка открыта и объявлена', () => {
		const { state, announce } = setup()
		expect(state.startThread(target, '   ')).toBeNull()
		const id = state.startThread(target, 'Нужно проверить')
		expect(id).toBeTruthy()
		expect(state.threads.value).toHaveLength(1)
		expect(state.activeThreadId.value).toBe(id)
		expect(announce).toHaveBeenCalledWith(UI_ROADMAP_REVIEW.ANNOUNCE_COMMENT)
		expect(state.threadsOf(target)).toHaveLength(1)
		expect(state.threadsOf({ entity: 'stage', id: 'a' })).toEqual([])
		expect(state.visibleThreads.value).toHaveLength(1)
	})

	it('reply добавляет ответ (в том числе к комментарию), пустой игнорирует', () => {
		const { state, announce } = setup()
		const id = state.startThread(target, 'Первый') as string
		state.reply(id, '')
		state.reply(id, 'Ответ')
		const first = state.threads.value[0].comments[0]
		state.reply(id, 'Вложенный', first.id)
		expect(state.threads.value[0].comments.map(item => item.text)).toEqual(['Первый', 'Ответ'])
		expect(JSON.stringify(state.threads.value[0].comments[0])).toContain('Вложенный')
		expect(announce).toHaveBeenLastCalledWith(UI_ROADMAP_REVIEW.ANNOUNCE_REPLY)
	})

	it('setResolved решает и открывает заново, скрытые решённые убираются из видимых', () => {
		const { state, announce } = setup()
		const id = state.startThread(target, 'Вопрос') as string
		state.setResolved(id, true)
		expect(state.threads.value[0].isResolved).toBe(true)
		expect(announce).toHaveBeenLastCalledWith(UI_ROADMAP_REVIEW.ANNOUNCE_RESOLVED)
		state.isResolvedShown.value = false
		expect(state.visibleThreads.value).toEqual([])
		state.setResolved(id, false)
		expect(announce).toHaveBeenLastCalledWith(UI_ROADMAP_REVIEW.ANNOUNCE_REOPENED)
		expect(state.visibleThreads.value).toHaveLength(1)
	})

	it('openThread читает непрочитанную цепочку; закрытие и прочитанная ничего не пишут', () => {
		const { state, emitReview } = setup({
			currentUser: { name: 'Роман' },
			threads: [
				{ id: 't1', target, comments: [{ id: 'c1', author: { name: 'Анна' }, text: 'Привет', date: 1 }], isUnread: true },
				{ id: 't2', target, comments: [], isUnread: false },
			],
		})
		expect(state.unreadCount.value).toBe(1)
		state.openThread('t2')
		state.openThread(null)
		state.openThread('нет')
		expect(emitReview).not.toHaveBeenCalled()
		state.openThread('t1')
		expect(state.activeThreadId.value).toBe('t1')
		expect(state.unreadCount.value).toBe(0)
		expect(emitReview).toHaveBeenCalledOnce()
	})
})

describe('nextRoadmapReviewId и автор по умолчанию', () => {
	it('занятый следующий номер пропускается', () => {
		expect(nextRoadmapReviewId('p', ['p2', 'p3'])).toBe('p4')
		expect(nextRoadmapReviewId('c', [])).toBe('c1')
	})

	it('цепочка без пользователя получает автора «Гость»', () => {
		const { state } = setup({})
		state.startThread({ entity: 'topic', id: 'a' }, 'Привет')
		expect(state.threads.value[0].comments[0].author.name).toBe(UI_ROADMAP_REVIEW.AUTHOR_GUEST)
	})
})

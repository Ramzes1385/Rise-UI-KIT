import { nextTick } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { getFlowReview } from '../../../../model/review/useFlowReview'
import type { FlowChange, FlowVersion } from '../../../../types/data/flowReview.types'
import {
	ANNA,
	BORIS,
	addEdgeD,
	addNodeD,
	createReviewHarness,
	moveB,
	removeC,
	renameA,
	reviewData,
	suggestion,
} from '../../fixtures/reviewHarness'

const renameC: FlowChange = { type: 'update', entity: 'node', id: 'c', patch: { label: 'Гамма' }, previous: { label: 'Gamma' } }

const versions = (): FlowVersion[] => [
	{ id: 'v1', label: 'v1', date: 1000, data: reviewData() },
	{
		id: 'v2',
		label: 'v2',
		date: 2000,
		author: BORIS,
		data: reviewData({ nodes: [...reviewData().nodes, { id: 'd', kind: 'service', label: 'Delta' }] }),
	},
]

describe('getFlowReview', () => {
	it('состояние найдено по модели; для чужой модели — понятная ошибка', () => {
		const { model, state } = createReviewHarness()
		expect(getFlowReview(model)).toBe(state)
		expect(() => getFlowReview({})).toThrow('review state is missing')
	})

	it('режим «Правки» включён только при mode=review', async () => {
		const { state, props } = createReviewHarness()
		expect(state.isActive.value).toBe(true)
		props.mode = 'view'
		await nextTick()
		expect(state.isActive.value).toBe(false)
		expect(state.tab.value).toBe('suggestions')
		expect(state.currentUser.value).toEqual(ANNA)
	})
})

describe('предложения: зеркало props и событий', () => {
	it('берёт предложения из props и обновляется при смене props', async () => {
		const { state, props } = createReviewHarness({ suggestions: [suggestion('s1', [renameA])] })
		expect(state.suggestions.list.value.map(item => item.id)).toEqual(['s1'])
		props.suggestions = [suggestion('s2', [moveB]), suggestion('s3', [moveB])]
		await nextTick()
		expect(state.suggestions.list.value.map(item => item.id)).toEqual(['s2', 's3'])
		props.suggestions = undefined
		await nextTick()
		expect(state.suggestions.list.value).toEqual([])
	})

	it('без props.suggestions список пуст; событие update:suggestions подменяет список', async () => {
		const { state, model } = createReviewHarness()
		expect(state.suggestions.list.value).toEqual([])
		model.events.emit('update:suggestions', [suggestion('x', [renameA])])
		expect(state.suggestions.list.value.map(item => item.id)).toEqual(['x'])
	})

	it('после размонтирования события список не меняют', () => {
		const { state, model, stop } = createReviewHarness({ suggestions: [suggestion('s1', [renameA])] })
		stop()
		model.events.emit('update:suggestions', [])
		expect(state.suggestions.list.value).toHaveLength(1)
	})
})

describe('предложения: список, фильтры, счётчики', () => {
	const list = () => [
		suggestion('old', [renameA], { date: 1000 }),
		suggestion('new', [moveB], { date: 3000, author: BORIS }),
		suggestion('done', [renameA], { date: 2000, status: 'accepted' }),
		suggestion('no', [renameA], { date: 500, status: 'declined', author: BORIS }),
	]

	it('новые сверху, счётчики и авторы считаются по всем предложениям', () => {
		const { state } = createReviewHarness({ suggestions: list() })
		expect(state.suggestions.views.value.map(item => item.suggestion.id)).toEqual(['new', 'done', 'old', 'no'])
		expect(state.suggestions.counts.value).toEqual({ open: 2, accepted: 1, declined: 1 })
		expect(state.suggestions.authors.value.map(item => item.name)).toEqual([ANNA.name, BORIS.name])
	})

	it('«Только мои» оставляет предложения текущего пользователя', () => {
		const { state } = createReviewHarness({ suggestions: list() })
		state.filters.show.value = 'mine'
		expect(state.suggestions.views.value.map(item => item.suggestion.id)).toEqual(['done', 'old'])
	})

	it('«Неразрешённые» — только ждущие, скрытие автора и принятых', () => {
		const { state } = createReviewHarness({ suggestions: list() })
		state.filters.show.value = 'open'
		expect(state.suggestions.views.value.map(item => item.suggestion.id)).toEqual(['new', 'old'])
		state.filters.show.value = 'all'
		state.filters.toggleAuthor(BORIS.name)
		expect(state.filters.hidden.value.has(BORIS.name)).toBe(true)
		expect(state.suggestions.views.value.map(item => item.suggestion.id)).toEqual(['done', 'old'])
		state.filters.toggleAuthor(BORIS.name)
		expect(state.filters.hidden.value.size).toBe(0)
		state.filters.isDoneShown.value = false
		expect(state.suggestions.views.value.map(item => item.suggestion.id)).toEqual(['new', 'old'])
	})

	it('предложение от другой версии помечено устаревшим', () => {
		const { state } = createReviewHarness({
			versions: versions(),
			suggestions: [suggestion('fresh', [renameA], { baseVersion: 'v2' }), suggestion('stale', [renameA], { baseVersion: 'v1' })],
		})
		const flags = Object.fromEntries(state.suggestions.views.value.map(item => [item.suggestion.id, item.isStale]))
		expect(flags).toEqual({ fresh: false, stale: true })
	})

	it('предложение, конфликтующее с данными, устарело, пока данные не вернулись', async () => {
		const { state, props } = createReviewHarness({ suggestions: [suggestion('s', [renameA])] })
		expect(state.suggestions.views.value[0].isStale).toBe(false)
		props.data = reviewData({ nodes: [{ id: 'a', kind: 'service', label: 'Другое' }] })
		await nextTick()
		expect(state.suggestions.views.value[0].isStale).toBe(true)
	})
})

describe('черновик и отправка предложений', () => {
	it('в режиме «Правки» изменения идут в черновик, данные не меняются', async () => {
		const { state, model } = createReviewHarness()
		await model.controller.updateNode('a', { label: 'Новое' })
		expect(model.controller.getData().nodes[0].label).toBe('Alpha')
		expect(state.suggestions.draftChanges.value).toHaveLength(1)
		expect(state.suggestions.draftCount.value).toBe(1)
	})

	it('правки одного элемента — одно предложение, правки разных элементов — отдельные', async () => {
		const { state, model, announced } = createReviewHarness()
		await model.controller.updateNode('a', { label: 'Новое' })
		await model.controller.updateNode('a', { color: 'red' })
		await model.controller.updateNode('c', { label: 'Гамма' })
		expect(state.suggestions.draftChanges.value).toHaveLength(3)
		expect(state.suggestions.draftCount.value).toBe(2)
		const sent = state.suggestions.submit()
		expect(sent).toHaveLength(2)
		expect(sent.map(item => item.changes.length)).toEqual([2, 1])
		expect(sent.every(item => item.author === ANNA && item.status === 'open')).toBe(true)
		expect(state.suggestions.list.value).toHaveLength(2)
		expect(announced).toContain(formatMessage(UI_FLOW_REVIEW.ANNOUNCE_SENT, { count: 2 }))
	})

	it('новый узел и его связь уходят одним предложением', () => {
		const { state, model } = createReviewHarness()
		Object.assign(model.draft, { value: suggestion('draft', [addNodeD, addEdgeD, renameA]) })
		expect(state.suggestions.draftCount.value).toBe(2)
		const sent = state.suggestions.submit()
		expect(sent.map(item => item.changes.length)).toEqual([2, 1])
	})

	it('отправленное из черновика не отправляется повторно, новые правки копятся дальше', async () => {
		const { state, model } = createReviewHarness()
		await model.controller.updateNode('a', { label: 'Новое' })
		state.suggestions.submit()
		expect(state.suggestions.draftChanges.value).toEqual([])
		expect(state.suggestions.draftCount.value).toBe(0)
		await model.controller.updateNode('b', { label: 'Бета' })
		expect(state.suggestions.draftChanges.value).toHaveLength(1)
		expect(state.suggestions.submit()).toHaveLength(1)
		expect(state.suggestions.list.value).toHaveLength(2)
	})

	it('пустой черновик: ничего не отправляется и не озвучивается', () => {
		const { state, announced } = createReviewHarness()
		expect(state.suggestions.submit()).toEqual([])
		expect(announced).toEqual([])
		state.suggestions.discard()
		expect(state.suggestions.draftChanges.value).toEqual([])
	})

	it('без текущего пользователя предложение не создаётся', async () => {
		const { state, model, announced } = createReviewHarness({ currentUser: undefined })
		await model.controller.updateNode('a', { label: 'Новое' })
		expect(state.suggestions.submit()).toEqual([])
		expect(announced).toEqual([])
		expect(state.currentUser.value).toBeUndefined()
	})

	it('«Сбросить» прячет черновик; следующая правка снова появляется', async () => {
		const { state, model } = createReviewHarness()
		await model.controller.updateNode('a', { label: 'Новое' })
		state.suggestions.discard()
		expect(state.suggestions.draftCount.value).toBe(0)
		await model.controller.updateNode('b', { label: 'Бета' })
		expect(state.suggestions.draftChanges.value).toHaveLength(1)
	})

	it('когда модель сама обнулила черновик, счётчик сброса начинается заново', async () => {
		const { state, model } = createReviewHarness()
		await model.controller.updateNode('a', { label: 'Новое' })
		state.suggestions.discard()
		const draft = model.draft.value
		expect(draft).not.toBeNull()
		model.controller.suggest(draft?.changes ?? [])
		await nextTick()
		expect(model.draft.value).toBeNull()
		await model.controller.updateNode('b', { label: 'Бета' })
		expect(state.suggestions.draftChanges.value).toHaveLength(1)
	})
})

describe('принять и отклонить', () => {
	it('принятие — один шаг истории с источником review, событием accept и озвучкой; отменяется одним undo', async () => {
		const { state, model, eventsOf, announced } = createReviewHarness({ suggestions: [suggestion('s1', [renameA, moveB])] })
		const accepted = await state.suggestions.accept('s1')
		expect(accepted).toBe(true)
		const data = model.controller.getData()
		expect(data.nodes.map(node => node.label)).toEqual(['Альфа', 'Beta', 'Gamma'])
		expect(data.nodes[1].position).toEqual({ x: 340, y: 40 })
		expect((eventsOf('change')[0] as { source: string }).source).toBe('review')
		expect(eventsOf('accept')).toHaveLength(1)
		expect(state.suggestions.list.value[0].status).toBe('accepted')
		expect(announced).toContain(formatMessage(UI_FLOW_REVIEW.ANNOUNCE_ACCEPTED, { label: 'Предложение s1' }))
		model.controller.undo()
		const restored = model.controller.getData()
		expect(restored.nodes.map(node => node.label)).toEqual(['Alpha', 'Beta', 'Gamma'])
		expect(restored.nodes[1].position).toEqual({ x: 300, y: 0 })
		expect(model.controller.getHistory().canUndo).toBe(false)
	})

	it('принять неизвестное или уже разобранное нельзя, озвучки нет', async () => {
		const { state, announced } = createReviewHarness({ suggestions: [suggestion('s1', [renameA], { status: 'declined' })] })
		expect(await state.suggestions.accept('s1')).toBe(false)
		expect(await state.suggestions.accept('nope')).toBe(false)
		expect(announced).toEqual([])
	})

	it('хук beforeAccept может отменить принятие', async () => {
		const { state, model, announced } = createReviewHarness({ suggestions: [suggestion('s1', [renameA])] })
		model.controller.on('beforeAccept', () => false)
		expect(await state.suggestions.accept('s1')).toBe(false)
		expect(state.suggestions.list.value[0].status).toBe('open')
		expect(announced).toEqual([])
	})

	it('озвучка принятия без подписи использует подпись по умолчанию', async () => {
		const { state, announced } = createReviewHarness({ suggestions: [suggestion('s1', [renameA], { label: undefined })] })
		await state.suggestions.accept('s1')
		expect(announced).toHaveLength(1)
	})

	it('отклонить: статус, событие, озвучка; данные не меняются', () => {
		const { state, model, eventsOf, announced } = createReviewHarness({ suggestions: [suggestion('s1', [renameA])] })
		state.suggestions.decline('s1')
		expect(state.suggestions.list.value[0].status).toBe('declined')
		expect(eventsOf('decline')).toHaveLength(1)
		expect(announced).toContain(formatMessage(UI_FLOW_REVIEW.ANNOUNCE_DECLINED, { label: 'Предложение s1' }))
		expect(model.controller.getData().nodes[0].label).toBe('Alpha')
	})

	it('отклонить неизвестное — без события, подпись по умолчанию', () => {
		const { state, eventsOf, announced } = createReviewHarness()
		state.suggestions.decline('nope')
		expect(eventsOf('decline')).toHaveLength(0)
		expect(announced).toEqual([formatMessage(UI_FLOW_REVIEW.ANNOUNCE_DECLINED, { label: UI_FLOW_REVIEW.SUGGESTION_UNTITLED })])
	})

	it('«Принять все» берёт ждущие и не устаревшие', async () => {
		const { state, model } = createReviewHarness({
			versions: versions(),
			suggestions: [
				suggestion('ok1', [renameA], { baseVersion: 'v2', date: 3000 }),
				suggestion('stale', [moveB], { baseVersion: 'v1', date: 2000 }),
				suggestion('ok2', [renameC], { baseVersion: 'v2', date: 1000 }),
				suggestion('done', [renameA], { status: 'declined', date: 500 }),
			],
		})
		expect(await state.suggestions.acceptAll()).toBe(2)
		const statuses = Object.fromEntries(state.suggestions.list.value.map(item => [item.id, item.status]))
		expect(statuses).toEqual({ ok1: 'accepted', stale: 'open', ok2: 'accepted', done: 'declined' })
		expect(model.controller.getData().nodes.map(node => node.label)).toEqual(['Альфа', 'Beta', 'Гамма'])
	})

	it('«Принять все» не считает то, что не применилось', async () => {
		const { state, model } = createReviewHarness({ suggestions: [suggestion('s1', [renameA])] })
		model.controller.on('beforeAccept', () => false)
		expect(await state.suggestions.acceptAll()).toBe(0)
	})
})

describe('версии и сравнение', () => {
	it('версии — новые сверху, текущая — самая поздняя', () => {
		const { state } = createReviewHarness({ versions: versions() })
		expect(state.compare.versions.value.map(item => item.id)).toEqual(['v2', 'v1'])
		expect(state.compare.currentId.value).toBe('v2')
		expect(state.compare.side.value).toBe('diff')
		expect(state.compare.compareId.value).toBeNull()
		expect(state.compare.changes.value).toEqual([])
	})

	it('без версий текущей нет', () => {
		const { state } = createReviewHarness()
		expect(state.compare.versions.value).toEqual([])
		expect(state.compare.currentId.value).toBeUndefined()
	})

	it('выбор версии даёт изменения «было → стало» и сводку', () => {
		const { state } = createReviewHarness({ versions: versions(), data: versions()[1].data })
		state.compare.select('v1')
		expect(state.compare.compareId.value).toBe('v1')
		expect(state.compare.changes.value).toContainEqual({
			type: 'add',
			entity: 'node',
			value: expect.objectContaining({ id: 'd' }),
			index: 3,
		})
		expect(state.compare.counts.value).toContainEqual({ kind: 'add', entity: 'node', count: 1 })
		state.compare.select(null)
		expect(state.compare.changes.value).toEqual([])
		expect(state.compare.counts.value).toEqual([])
	})

	it('compareWith из props включает сравнение и следует за props', async () => {
		const { state, props } = createReviewHarness({ versions: versions(), compareWith: 'v1', data: versions()[1].data })
		expect(state.compare.compareId.value).toBe('v1')
		props.compareWith = null
		await nextTick()
		expect(state.compare.compareId.value).toBeNull()
		props.compareWith = 'v1'
		await nextTick()
		expect(state.compare.compareId.value).toBe('v1')
		props.compareWith = undefined
		await nextTick()
		expect(state.compare.compareId.value).toBeNull()
	})
})

describe('комментарии', () => {
	const thread = (extra = {}) => ({
		id: 't9',
		target: { entity: 'node' as const, id: 'a' },
		comments: [{ id: 'c9', author: BORIS, text: 'Вопрос', date: 1 }],
		...extra,
	})

	it('зеркало props.comments', async () => {
		const { state, props } = createReviewHarness({ comments: [thread()] })
		expect(state.comments.list.value.map(item => item.id)).toEqual(['t9'])
		props.comments = undefined
		await nextTick()
		expect(state.comments.list.value).toEqual([])
		props.comments = [thread()]
		await nextTick()
		expect(state.comments.list.value).toHaveLength(1)
	})

	it('без props.comments список пуст', () => {
		const { state } = createReviewHarness()
		expect(state.comments.list.value).toEqual([])
	})

	it('новая цепочка: события update:comments и comment (add), открытая цепочка, автор — текущий пользователь', () => {
		const { state, eventsOf } = createReviewHarness()
		const id = state.comments.start({ target: { entity: 'node', id: 'a' } }, '  Почему так?  ')
		expect(id).not.toBeNull()
		expect(state.comments.activeId.value).toBe(id)
		const [created] = state.comments.list.value
		expect(created.comments[0]).toMatchObject({ text: 'Почему так?', author: ANNA })
		expect(eventsOf('update:comments')).toHaveLength(1)
		expect(eventsOf('comment')).toEqual([{ thread: created, action: 'add' }])
	})

	it('пустой текст не создаёт цепочку и не отвечает', () => {
		const { state, eventsOf } = createReviewHarness({ comments: [thread()] })
		expect(state.comments.start({ point: { x: 1, y: 1 } }, '   ')).toBeNull()
		state.comments.reply('t9', '  ')
		expect(eventsOf('update:comments')).toEqual([])
	})

	it('без пользователя автор — пустое имя', () => {
		const { state } = createReviewHarness({ currentUser: undefined })
		state.comments.start({ point: { x: 1, y: 2 } }, 'Привет')
		expect(state.comments.list.value[0].comments[0].author).toEqual({ name: '' })
		expect(state.comments.list.value[0].point).toEqual({ x: 1, y: 2 })
	})

	it('ответ и вложенный ответ, событие comment (reply)', () => {
		const { state, eventsOf } = createReviewHarness({ comments: [thread()] })
		state.comments.reply('t9', 'Ответ')
		state.comments.reply('t9', 'Вложенный', 'c9')
		const [updated] = state.comments.list.value
		expect(updated.comments).toHaveLength(2)
		expect(updated.comments[0].replies?.[0].text).toBe('Вложенный')
		expect((eventsOf('comment') as { action: string }[]).map(item => item.action)).toEqual(['reply', 'reply'])
	})

	it('ответ в неизвестную цепочку событие comment не шлёт', () => {
		const { state, eventsOf } = createReviewHarness({ comments: [thread()] })
		state.comments.reply('nope', 'Ответ')
		expect(eventsOf('update:comments')).toHaveLength(1)
		expect(eventsOf('comment')).toEqual([])
	})

	it('решено и вернуть; решённые прячутся, когда их показ выключен', () => {
		const { state, eventsOf } = createReviewHarness({ comments: [thread(), thread({ id: 't10' })] })
		state.comments.setResolved('t9', true)
		expect(state.comments.list.value[0].isResolved).toBe(true)
		expect(state.comments.visible.value).toHaveLength(2)
		state.comments.isResolvedShown.value = false
		expect(state.comments.visible.value.map(item => item.id)).toEqual(['t10'])
		state.comments.setResolved('t9', false)
		expect(state.comments.visible.value).toHaveLength(2)
		expect((eventsOf('comment') as { action: string }[]).map(item => item.action)).toEqual(['resolve', 'reopen'])
	})

	it('непрочитанные: открытие цепочки помечает её прочитанной и шлёт update:comments один раз', () => {
		const { state, eventsOf } = createReviewHarness({ comments: [thread({ isUnread: true }), thread({ id: 't10' })] })
		expect(state.comments.unread.value).toBe(1)
		state.comments.open('t9')
		expect(state.comments.activeId.value).toBe('t9')
		expect(state.comments.unread.value).toBe(0)
		expect(eventsOf('update:comments')).toHaveLength(1)
		state.comments.open('t9')
		state.comments.open('t10')
		state.comments.open('nope')
		expect(eventsOf('update:comments')).toHaveLength(1)
		state.comments.open(null)
		expect(state.comments.activeId.value).toBeNull()
	})

	it('isJustClosed: цепочка только что закрыта — 300 мс; другая цепочка и закрытие без открытой не считаются', () => {
		vi.useFakeTimers()
		try {
			vi.setSystemTime(10_000)
			const { state } = createReviewHarness({ comments: [thread(), thread({ id: 't10' })] })
			state.comments.open(null)
			expect(state.comments.isJustClosed('t9')).toBe(false)
			state.comments.open('t9')
			expect(state.comments.isJustClosed('t9')).toBe(false)
			state.comments.open(null)
			expect(state.comments.isJustClosed('t9')).toBe(true)
			expect(state.comments.isJustClosed('t10')).toBe(false)
			vi.setSystemTime(10_299)
			expect(state.comments.isJustClosed('t9')).toBe(true)
			vi.setSystemTime(10_300)
			expect(state.comments.isJustClosed('t9')).toBe(false)
		} finally {
			vi.useRealTimers()
		}
	})
})

describe('метки на холсте', () => {
	it('вне режима «Правки» меток нет', async () => {
		const { state, props } = createReviewHarness({ suggestions: [suggestion('s1', [renameA])] })
		expect(state.marks.value).toHaveLength(1)
		props.mode = 'view'
		await nextTick()
		expect(state.marks.value).toEqual([])
	})

	it('метки открытых предложений несут id предложения и автора; разобранные не рисуются', () => {
		const { state } = createReviewHarness({
			suggestions: [
				suggestion('s1', [renameA]),
				suggestion('s2', [moveB], { author: BORIS }),
				suggestion('s3', [removeC], { status: 'accepted' }),
			],
		})
		expect(state.marks.value.map(item => [item.suggestionId, item.author, item.kind])).toEqual([
			['s1', ANNA.name, 'rename'],
			['s2', BORIS.name, 'move'],
		])
	})

	it('метки черновика — от текущего пользователя', async () => {
		const { state, model } = createReviewHarness()
		await model.controller.addNode({ id: 'd', kind: 'service', label: 'Delta' })
		expect(state.marks.value.map(item => [item.suggestionId, item.author, item.kind, item.id])).toEqual([
			['draft', ANNA.name, 'add', 'd'],
		])
	})

	it('при сравнении метки строятся по различиям версий', () => {
		const { state } = createReviewHarness({
			versions: versions(),
			data: versions()[1].data,
			suggestions: [suggestion('s1', [renameA])],
		})
		state.compare.select('v1')
		expect(state.marks.value.find(item => item.id === 'd')).toMatchObject({ kind: 'add' })
		expect(state.marks.value.find(item => item.id === 'd')?.suggestionId).toBeUndefined()
		expect(state.marks.value.some(item => item.suggestionId === 's1')).toBe(false)
	})
})

describe('приглушение остального', () => {
	function setup() {
		const harness = createReviewHarness({
			suggestions: [
				suggestion('s1', [renameA]),
				suggestion('s2', [{ type: 'update', entity: 'edge', id: 'e1', patch: { label: 'x' }, previous: { label: 'заказ' } }]),
			],
		})
		const highlight = vi.spyOn(harness.model.controller, 'highlightPath')
		const clear = vi.spyOn(harness.model.controller, 'clearHighlight')
		return { ...harness, highlight, clear }
	}

	it('без фокуса и фильтра ничего не приглушается', async () => {
		const { highlight, clear, state } = setup()
		await nextTick()
		expect(highlight).not.toHaveBeenCalled()
		state.filters.isOnlyChanged.value = false
		expect(clear).not.toHaveBeenCalled()
	})

	it('фокус на предложении подсвечивает его элементы и концы связей, снятие фокуса возвращает всё', async () => {
		const { highlight, clear, state } = setup()
		state.suggestions.focusId.value = 's2'
		await nextTick()
		expect(highlight).toHaveBeenLastCalledWith(expect.arrayContaining(['e1', 'a', 'b']))
		expect(highlight.mock.calls[0][0]).toHaveLength(3)
		state.suggestions.focusId.value = null
		await nextTick()
		expect(clear).toHaveBeenCalledTimes(1)
	})

	it('«Только изменения» подсвечивает все помеченные элементы', async () => {
		const { highlight, state } = setup()
		state.filters.isOnlyChanged.value = true
		await nextTick()
		expect(highlight.mock.calls[0][0]).toEqual(expect.arrayContaining(['a', 'e1', 'b']))
	})

	it('фокус на предложении без меток ничего не приглушает', async () => {
		const { highlight, state } = setup()
		state.suggestions.focusId.value = 'нет такого'
		await nextTick()
		expect(highlight).not.toHaveBeenCalled()
	})

	it('при выходе из режима «Правки» подсветка снимается', async () => {
		const { clear, state, props } = setup()
		state.filters.isOnlyChanged.value = true
		await nextTick()
		props.mode = 'view'
		await nextTick()
		expect(clear).toHaveBeenCalledTimes(1)
	})

	it('размонтирование снимает свою подсветку, а чужую не трогает', async () => {
		const own = setup()
		own.state.filters.isOnlyChanged.value = true
		await nextTick()
		own.stop()
		expect(own.clear).toHaveBeenCalledTimes(1)
		const idle = setup()
		idle.stop()
		expect(idle.clear).not.toHaveBeenCalled()
	})
})

describe('изменения других видов не ломают состояние', () => {
	it('добавление узла и связи в предложении даёт метки и вид «mixed»', () => {
		const { state } = createReviewHarness({ suggestions: [suggestion('s1', [addNodeD, addEdgeD, renameA])] })
		const [view] = state.suggestions.views.value
		expect(view.kind).toBe('mixed')
		expect(state.marks.value.map(item => item.id).sort()).toEqual(['a', 'd', 'e3'])
	})
})

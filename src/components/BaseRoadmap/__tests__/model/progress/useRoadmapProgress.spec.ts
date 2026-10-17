import { flushPromises } from '@vue/test-utils'
import { mountRoadmapModel } from '../fixtures/mountRoadmapModel'
import type { RoadmapStatusChange } from '../../../types/BaseRoadmap.types'
import { progressOf, roadmap, stage, topic } from '../fixtures/roadmapFixtures'

const subtopics = [
	{ id: 'x', title: 'X' },
	{ id: 'y', title: 'Y' },
	{ id: 'z', title: 'Z' },
]
const data = roadmap([
	stage('s1', [topic('a'), topic('b', { requires: ['a'] }), topic('t', { subtopics })]),
	stage('s2', [topic('c')], { requires: ['s1'] }),
])

function deferred<T>() {
	let resolve!: (value: T) => void
	let reject!: (reason: unknown) => void
	const promise = new Promise<T>((done, fail) => {
		resolve = done
		reject = fail
	})
	return { promise, resolve, reject }
}

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllEnvs()
})

describe('useRoadmapProgress: смена статуса', () => {
	it('ставит статус, обновляет прогресс и сообщает событиями в порядке update:progress → status-change → topic-complete → stage-complete', async () => {
		const small = roadmap([stage('s', [topic('a')])])
		const { model, order, emitted } = mountRoadmapModel({ data: small })
		expect(await model.setTopicStatus('a', 'done')).toBe(true)
		expect(order).toEqual(['update:progress', 'status-change', 'topic-complete', 'stage-complete'])
		expect(model.progress.value.topics.a?.status).toBe('done')
		expect(model.progress.value.topics.a?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
		expect(emitted('update:progress')[0]).toEqual([model.progress.value])
		expect(emitted('status-change')[0]).toEqual([expect.objectContaining({ from: 'available', to: 'done', source: 'api' })])
		expect(emitted('topic-complete')[0]).toEqual([{ topic: small.stages[0].topics[0], progress: model.progress.value }])
		expect(emitted('stage-complete')[0]).toEqual([{ stage: small.stages[0], progress: model.progress.value }])
	})

	it('источник смены — из аргумента', async () => {
		const { model, emitted } = mountRoadmapModel({ data })
		await model.setTopicStatus('a', 'in-progress', 'user')
		expect(emitted('status-change')[0]).toEqual([expect.objectContaining({ from: 'available', to: 'in-progress', source: 'user' })])
	})

	it('status-change — только по теме, которую меняли; зависимая тема просто открывается', async () => {
		const { model, emitted } = mountRoadmapModel({ data })
		await model.setTopicStatus('a', 'done')
		expect(emitted('status-change').map(([change]) => (change as RoadmapStatusChange).topic.id)).toEqual(['a'])
		expect(model.getTopicState('b')?.status).toBe('available')
	})

	it('то же значение — false, событий нет', async () => {
		const { model, order } = mountRoadmapModel({ data, progress: progressOf({ a: { status: 'done' } }) })
		expect(await model.setTopicStatus('a', 'done')).toBe(false)
		expect(order).toEqual([])
	})

	it('неизвестный id — false', async () => {
		const { model, order } = mountRoadmapModel({ data })
		expect(await model.setTopicStatus('ghost', 'done')).toBe(false)
		expect(order).toEqual([])
	})

	it('закрытая тема не отмечается', async () => {
		const { model, order } = mountRoadmapModel({ data })
		expect(await model.setTopicStatus('b', 'done')).toBe(false)
		expect(await model.setTopicStatus('c', 'in-progress')).toBe(false)
		expect(order).toEqual([])
	})

	it('у закрытой темы с устаревшей отметкой статус можно сбросить (null)', async () => {
		const { model } = mountRoadmapModel({ data, progress: progressOf({ b: { status: 'done' } }) })
		expect(model.getTopicState('b')?.status).toBe('locked')
		expect(await model.setTopicStatus('b', null)).toBe(true)
		expect(model.progress.value.topics.b?.status).toBeUndefined()
	})

	it('сброс статуса темы (null) возвращает «доступна» и шлёт status-change', async () => {
		const { model, emitted } = mountRoadmapModel({ data, progress: progressOf({ a: { status: 'done' } }) })
		expect(await model.setTopicStatus('a', null)).toBe(true)
		expect(emitted('status-change')).toContainEqual([expect.objectContaining({ from: 'done', to: 'available' })])
	})

	it('isDisabled — false, ничего не меняется', async () => {
		const { model, order } = mountRoadmapModel({ data, isDisabled: true })
		expect(await model.setTopicStatus('a', 'done')).toBe(false)
		expect(await model.toggleSubtopic('t', 'x')).toBe(false)
		expect(order).toEqual([])
	})

	it('смена прогресса без смены статуса (вторая подтема) — update:progress без status-change', async () => {
		const { model, order } = mountRoadmapModel({ data })
		await model.toggleSubtopic('t', 'x')
		order.length = 0
		await model.toggleSubtopic('t', 'y')
		expect(order).toEqual(['update:progress'])
	})
})

describe('useRoadmapProgress: подтемы', () => {
	it('переключает отметку без isDone, с источником subtopic', async () => {
		const { model, emitted } = mountRoadmapModel({ data })
		expect(await model.toggleSubtopic('t', 'x')).toBe(true)
		expect(model.progress.value.topics.t?.subtopics).toEqual(['x'])
		expect(emitted('status-change')[0]).toEqual([expect.objectContaining({ from: 'available', to: 'in-progress', source: 'subtopic' })])
		expect(await model.toggleSubtopic('t', 'x')).toBe(true)
		expect(model.progress.value.topics.t?.subtopics).toEqual([])
	})

	it('явный isDone; то же значение — false', async () => {
		const { model } = mountRoadmapModel({ data })
		expect(await model.toggleSubtopic('t', 'x', false)).toBe(false)
		expect(await model.toggleSubtopic('t', 'x', true)).toBe(true)
		expect(await model.toggleSubtopic('t', 'x', true)).toBe(false)
	})

	it('все подтемы — тема изучена, события topic-complete и stage-complete', async () => {
		const only = roadmap([stage('s', [topic('t', { subtopics })])])
		const { model, emitted } = mountRoadmapModel({ data: only })
		for (const { id } of subtopics) await model.toggleSubtopic('t', id)
		expect(model.getTopicState('t')).toMatchObject({ status: 'done', done: 3, total: 3, fraction: 1 })
		expect(emitted('topic-complete')).toHaveLength(1)
		expect(emitted('stage-complete')).toHaveLength(1)
	})

	it('неизвестные тема и подтема, закрытая тема — false', async () => {
		const { model, order } = mountRoadmapModel({ data })
		expect(await model.toggleSubtopic('ghost', 'x')).toBe(false)
		expect(await model.toggleSubtopic('t', 'ghost')).toBe(false)
		expect(await model.toggleSubtopic('b', 'x')).toBe(false)
		expect(order).toEqual([])
	})
})

describe('useRoadmapProgress: хук beforeStatusChange', () => {
	it('false отменяет смену: нет событий и записи', async () => {
		const beforeStatusChange = vi.fn(() => false)
		const { model, order } = mountRoadmapModel({ data, beforeStatusChange })
		expect(await model.setTopicStatus('a', 'done', 'user')).toBe(false)
		expect(order).toEqual([])
		expect(model.progress.value.topics).toEqual({})
		expect(model.busyTopics.value.size).toBe(0)
	})

	it('получает тему, статусы до и после и источник', async () => {
		const beforeStatusChange = vi.fn()
		const { model } = mountRoadmapModel({ data, beforeStatusChange })
		await model.setTopicStatus('a', 'done', 'user')
		expect(beforeStatusChange).toHaveBeenCalledWith({ topic: data.stages[0].topics[0], from: 'available', to: 'done', source: 'user' })
	})

	it('void и true разрешают смену', async () => {
		const hook = vi.fn().mockReturnValueOnce(undefined).mockReturnValueOnce(true)
		const { model } = mountRoadmapModel({ data, beforeStatusChange: hook })
		expect(await model.setTopicStatus('a', 'in-progress')).toBe(true)
		expect(await model.setTopicStatus('a', 'done')).toBe(true)
	})

	it('Promise ждётся; пока ждём, тема в busyTopics, а повторная смена той же темы — false', async () => {
		const gate = deferred<boolean>()
		const { model, order } = mountRoadmapModel({ data, beforeStatusChange: () => gate.promise })
		const first = model.setTopicStatus('a', 'done')
		expect(model.busyTopics.value.has('a')).toBe(true)
		expect(order).toEqual([])
		expect(await model.setTopicStatus('a', 'skipped')).toBe(false)
		gate.resolve(true)
		expect(await first).toBe(true)
		expect(model.busyTopics.value.has('a')).toBe(false)
		expect(model.progress.value.topics.a?.status).toBe('done')
	})

	it('другая тема во время ожидания хука меняется свободно', async () => {
		const gate = deferred<boolean>()
		const hook = vi.fn().mockReturnValueOnce(gate.promise).mockReturnValue(true)
		const { model } = mountRoadmapModel({ data, beforeStatusChange: hook })
		const first = model.setTopicStatus('a', 'done')
		expect(await model.setTopicStatus('t', 'in-progress')).toBe(true)
		gate.resolve(true)
		expect(await first).toBe(true)
		expect(Object.keys(model.progress.value.topics).sort()).toEqual(['a', 't'])
	})

	it('Promise с false отменяет смену и снимает busy', async () => {
		const { model, order } = mountRoadmapModel({ data, beforeStatusChange: async () => false })
		expect(await model.setTopicStatus('a', 'done')).toBe(false)
		expect(order).toEqual([])
		expect(model.busyTopics.value.size).toBe(0)
	})

	it('исключение в хуке: смена отменена, предупреждение HOOK_FAILED в разработке', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { model, order } = mountRoadmapModel({
			data,
			beforeStatusChange: () => {
				throw new Error('сервер недоступен')
			},
		})
		expect(await model.setTopicStatus('a', 'done')).toBe(false)
		expect(order).toEqual([])
		expect(model.busyTopics.value.size).toBe(0)
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('сервер недоступен'))
	})

	it('отклонённый Promise хука — то же; в production без предупреждения', async () => {
		vi.stubEnv('NODE_ENV', 'production')
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { model } = mountRoadmapModel({ data, beforeStatusChange: () => Promise.reject(new Error('нет')) })
		expect(await model.setTopicStatus('a', 'done')).toBe(false)
		expect(warn).not.toHaveBeenCalled()
	})

	it('пока ждём хук, тот же итог пришёл снаружи (v-model): смена не дублируется', async () => {
		const gate = deferred<boolean>()
		const { model, wrapper, order } = mountRoadmapModel({ data, beforeStatusChange: () => gate.promise })
		const pending = model.setTopicStatus('a', 'done')
		await wrapper.setProps({ progress: progressOf({ a: { status: 'done' } }) })
		gate.resolve(true)
		expect(await pending).toBe(false)
		expect(order).toEqual([])
	})

	it('пока ждём хук, прогресс изменился снаружи: смена накладывается на свежий прогресс', async () => {
		const gate = deferred<boolean>()
		const { model, wrapper } = mountRoadmapModel({ data, beforeStatusChange: () => gate.promise })
		const pending = model.setTopicStatus('t', 'in-progress')
		await wrapper.setProps({ progress: progressOf({ a: { status: 'done' } }) })
		gate.resolve(true)
		expect(await pending).toBe(true)
		expect(Object.keys(model.progress.value.topics).sort()).toEqual(['a', 't'])
	})
})

describe('useRoadmapProgress: прогресс', () => {
	it('начальный прогресс — из пропса; пустой, если пропса нет', () => {
		expect(mountRoadmapModel({ data }).model.progress.value).toEqual({ version: 1, topics: {} })
		const given = progressOf({ a: { status: 'done' } })
		expect(mountRoadmapModel({ data, progress: given }).model.progress.value).toEqual(given)
	})

	it('v-model:progress: новое значение пропса подхватывается, undefined — игнорируется', async () => {
		const { model, wrapper } = mountRoadmapModel({ data })
		const next = progressOf({ a: { status: 'done' } })
		await wrapper.setProps({ progress: next })
		expect(model.progress.value).toEqual(next)
		await wrapper.setProps({ progress: undefined })
		expect(model.progress.value).toEqual(next)
	})

	it('resetProgress очищает прогресс и шлёт update:progress', async () => {
		const { model, emitted } = mountRoadmapModel({ data, progress: progressOf({ a: { status: 'done' } }) })
		model.resetProgress()
		await flushPromises()
		expect(model.progress.value).toEqual({ version: 1, topics: {} })
		expect(emitted('update:progress')).toEqual([[{ version: 1, topics: {} }]])
	})

	it('resetProgress при isDisabled ничего не делает', () => {
		const given = progressOf({ a: { status: 'done' } })
		const { model, order } = mountRoadmapModel({ data, progress: given, isDisabled: true })
		model.resetProgress()
		expect(model.progress.value).toEqual(given)
		expect(order).toEqual([])
	})
})

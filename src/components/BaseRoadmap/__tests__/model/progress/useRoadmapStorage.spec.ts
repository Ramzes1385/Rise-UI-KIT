import { defineComponent, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { flushPromises, mount } from '@vue/test-utils'
import type { RoadmapStatusChange } from '../../../types/BaseRoadmap.types'
import { progressOf, roadmap, stage, topic } from '../fixtures/roadmapFixtures'
import { fakeStorage, mountRoadmapModel, RoadmapHost } from '../fixtures/mountRoadmapModel'

const data = roadmap([stage('s', [topic('a'), topic('b'), topic('c')])], { id: 'vue' })
const OLD = '2026-10-18T09:00:00.000Z'
const NEW = '2026-10-18T11:00:00.000Z'

beforeEach(() => {
	vi.useFakeTimers()
})

afterEach(() => {
	vi.useRealTimers()
	vi.restoreAllMocks()
})

describe('useRoadmapStorage: загрузка', () => {
	it('при монтировании читает прогресс по ключу data.id и сливает его', async () => {
		const storage = fakeStorage(progressOf({ a: { status: 'done', updatedAt: OLD } }))
		const { model, emitted } = mountRoadmapModel({ data, storage })
		await flushPromises()
		expect(storage.load).toHaveBeenCalledExactlyOnceWith('vue')
		expect(model.progress.value.topics.a?.status).toBe('done')
		expect(emitted('update:progress')).toHaveLength(1)
		expect(emitted('progress-load')).toEqual([[model.progress.value]])
	})

	it('без data.id ключ — roadmap-<хеш названия>', async () => {
		const storage = fakeStorage()
		mountRoadmapModel({ data: roadmap([], { title: 'Путь' }), storage })
		await flushPromises()
		expect(storage.load).toHaveBeenCalledWith(expect.stringMatching(/^roadmap-/))
	})

	it('асинхронное хранилище: load возвращает Promise', async () => {
		const storage = fakeStorage()
		storage.load.mockResolvedValue(progressOf({ b: { status: 'skipped', updatedAt: OLD } }))
		const { model } = mountRoadmapModel({ data, storage })
		await flushPromises()
		expect(model.progress.value.topics.b?.status).toBe('skipped')
	})

	it('хук вызывается с source «storage» на каждую принесённую тему; отклонённые остаются как были', async () => {
		const storage = fakeStorage(progressOf({ a: { status: 'done', updatedAt: OLD }, b: { status: 'done', updatedAt: OLD } }))
		const beforeStatusChange = vi.fn((change: RoadmapStatusChange) => change.topic.id !== 'a')
		const { model, emitted } = mountRoadmapModel({ data, storage, beforeStatusChange })
		await flushPromises()
		expect(beforeStatusChange.mock.calls.map(([change]) => [change.topic.id, change.source])).toEqual([
			['a', 'storage'],
			['b', 'storage'],
		])
		expect(model.progress.value.topics.a).toBeUndefined()
		expect(model.progress.value.topics.b?.status).toBe('done')
		expect(emitted('status-change')).toEqual([[expect.objectContaining({ from: 'available', to: 'done', source: 'storage' })]])
	})

	it('все темы отклонены — update:progress не шлётся, progress-load всё равно', async () => {
		const storage = fakeStorage(progressOf({ a: { status: 'done', updatedAt: OLD } }))
		const { order } = mountRoadmapModel({ data, storage, beforeStatusChange: () => false })
		await flushPromises()
		expect(order).toEqual(['progress-load'])
	})

	it('слияние по updatedAt: более новое из хранилища берётся, более новое локальное остаётся и пишется обратно через 300 мс', async () => {
		const storage = fakeStorage(progressOf({ a: { status: 'skipped', updatedAt: OLD }, b: { status: 'done', updatedAt: NEW } }))
		const local = progressOf({ a: { status: 'done', updatedAt: NEW }, b: { status: 'skipped', updatedAt: OLD } })
		const { model, emitted } = mountRoadmapModel({ data, storage, progress: local })
		await flushPromises()
		expect(model.progress.value.topics.a?.status).toBe('done')
		expect(model.progress.value.topics.b?.status).toBe('done')
		expect(storage.save).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(300)
		expect(storage.save).toHaveBeenCalledExactlyOnceWith('vue', model.progress.value)
		expect(emitted('progress-save')).toHaveLength(1)
	})

	it('темы, которых нет в данных (устаревшие id), из хранилища не берутся', async () => {
		const storage = fakeStorage(progressOf({ ghost: { status: 'done', updatedAt: OLD }, a: { status: 'done', updatedAt: OLD } }))
		const { model } = mountRoadmapModel({ data, storage })
		await flushPromises()
		expect(Object.keys(model.progress.value.topics)).toEqual(['a'])
	})

	it('в хранилище нет записи — ничего не происходит', async () => {
		const storage = fakeStorage(null)
		const { order } = mountRoadmapModel({ data, storage })
		await flushPromises()
		await vi.advanceTimersByTimeAsync(1000)
		expect(order).toEqual([])
		expect(storage.save).not.toHaveBeenCalled()
	})

	it('load бросает или отклоняется — progress-error, прогресс не меняется', async () => {
		const failing = fakeStorage()
		failing.load.mockImplementation(() => {
			throw new Error('сломано')
		})
		const first = mountRoadmapModel({ data, storage: failing })
		await flushPromises()
		expect(first.emitted('progress-error')).toEqual([[new Error('сломано')]])
		expect(first.emitted('progress-load')).toEqual([])

		const rejecting = fakeStorage()
		rejecting.load.mockRejectedValue('отказ')
		const second = mountRoadmapModel({ data, storage: rejecting })
		await flushPromises()
		expect(second.emitted('progress-error')).toEqual([['отказ']])
	})

	it('storage: null и storage не задан — ничего не вызывается', async () => {
		const withNull = mountRoadmapModel({ data, storage: null })
		const without = mountRoadmapModel({ data })
		await withNull.model.setTopicStatus('a', 'done')
		await without.model.setTopicStatus('a', 'done')
		await vi.advanceTimersByTimeAsync(1000)
		expect(withNull.emitted('progress-save')).toEqual([])
		expect(without.emitted('progress-error')).toEqual([])
	})

	it('SSR: при серверной отрисовке хранилище не читается', async () => {
		const storage = fakeStorage(progressOf({ a: { status: 'done' } }))
		await renderToString(h(RoadmapHost, { data, storage }))
		expect(storage.load).not.toHaveBeenCalled()
	})

	it('смена data.id — загрузка заново по новому ключу', async () => {
		const storage = fakeStorage()
		const { wrapper } = mountRoadmapModel({ data, storage })
		await flushPromises()
		await wrapper.setProps({ data: { ...data, id: 'react' } })
		await flushPromises()
		expect(storage.load.mock.calls.map(([key]) => key)).toEqual(['vue', 'react'])
	})

	it('смена ключа до монтирования загрузку не запускает: читается один раз, после монтирования', async () => {
		const storage = fakeStorage()
		const id = ref('vue')
		const Mutator = defineComponent({
			setup() {
				id.value = 'react'
				return () => h('i')
			},
		})
		const Parent = defineComponent({
			setup() {
				const isShown = ref(false)
				return { isShown }
			},
			render() {
				return this.isShown ? [h(RoadmapHost, { data: { ...data, id: id.value }, storage }), h(Mutator)] : h('b')
			},
		})
		const wrapper = mount(Parent)
		await wrapper.setData({ isShown: true })
		await flushPromises()
		expect(storage.load.mock.calls.map(([key]) => key)).toEqual(['react'])
	})

	it('смена хранилища — загрузка из нового', async () => {
		const first = fakeStorage()
		const second = fakeStorage()
		const { wrapper } = mountRoadmapModel({ data, storage: first })
		await flushPromises()
		await wrapper.setProps({ storage: second })
		await flushPromises()
		expect(second.load).toHaveBeenCalledOnce()
	})

	it('устаревший ответ load (ключ сменился, пока ждали) отбрасывается', async () => {
		let resolveFirst!: (value: ReturnType<typeof progressOf>) => void
		const storage = fakeStorage()
		storage.load
			.mockImplementationOnce(() => new Promise(resolve => (resolveFirst = resolve)))
			.mockResolvedValueOnce(progressOf({ b: { status: 'done', updatedAt: OLD } }))
		const { model, wrapper, emitted } = mountRoadmapModel({ data, storage })
		await wrapper.setProps({ data: { ...data, id: 'react' } })
		await flushPromises()
		resolveFirst(progressOf({ a: { status: 'done', updatedAt: OLD } }))
		await flushPromises()
		expect(model.progress.value.topics.a).toBeUndefined()
		expect(model.progress.value.topics.b?.status).toBe('done')
		expect(emitted('progress-load')).toHaveLength(1)
	})

	it('ответ load после размонтирования отбрасывается', async () => {
		let resolveLoad!: (value: ReturnType<typeof progressOf>) => void
		const storage = fakeStorage()
		storage.load.mockImplementation(() => new Promise(resolve => (resolveLoad = resolve)))
		const { wrapper, emitted } = mountRoadmapModel({ data, storage })
		wrapper.unmount()
		resolveLoad(progressOf({ a: { status: 'done', updatedAt: OLD } }))
		await flushPromises()
		expect(emitted('progress-load')).toEqual([])
	})
})

describe('useRoadmapStorage: запись', () => {
	it('пишет через 300 мс после последнего изменения: серия отметок — одна запись', async () => {
		const storage = fakeStorage()
		const { model, emitted } = mountRoadmapModel({ data, storage })
		await flushPromises()
		await model.setTopicStatus('a', 'done')
		await vi.advanceTimersByTimeAsync(200)
		await model.setTopicStatus('b', 'done')
		await vi.advanceTimersByTimeAsync(299)
		expect(storage.save).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(1)
		expect(storage.save).toHaveBeenCalledExactlyOnceWith('vue', model.progress.value)
		expect(emitted('progress-save')).toEqual([[model.progress.value]])
	})

	it('прогресс сохраняется и при сбросе', async () => {
		const storage = fakeStorage()
		const { model } = mountRoadmapModel({ data, storage, progress: progressOf({ a: { status: 'done' } }) })
		await flushPromises()
		model.resetProgress()
		await vi.advanceTimersByTimeAsync(300)
		expect(storage.save).toHaveBeenCalledWith('vue', { version: 1, topics: {} })
	})

	it('при размонтировании несохранённое пишется сразу; без изменений — не пишется', async () => {
		const storage = fakeStorage()
		const changed = mountRoadmapModel({ data, storage })
		await flushPromises()
		await changed.model.setTopicStatus('a', 'done')
		changed.wrapper.unmount()
		expect(storage.save).toHaveBeenCalledOnce()
		await vi.advanceTimersByTimeAsync(1000)
		expect(storage.save).toHaveBeenCalledOnce()

		const untouched = fakeStorage()
		const idle = mountRoadmapModel({ data, storage: untouched })
		await flushPromises()
		idle.wrapper.unmount()
		expect(untouched.save).not.toHaveBeenCalled()
	})

	it('save бросает или отклоняется — progress-error, без progress-save', async () => {
		const storage = fakeStorage()
		storage.save.mockImplementationOnce(() => {
			throw new Error('квота')
		})
		storage.save.mockRejectedValueOnce(new Error('сеть'))
		const { model, emitted } = mountRoadmapModel({ data, storage })
		await flushPromises()
		await model.setTopicStatus('a', 'done')
		await vi.advanceTimersByTimeAsync(300)
		await model.setTopicStatus('b', 'done')
		await vi.advanceTimersByTimeAsync(300)
		expect(emitted('progress-error')).toEqual([[new Error('квота')], [new Error('сеть')]])
		expect(emitted('progress-save')).toEqual([])
	})

	it('хранилище убрали до срабатывания таймера — запись пропускается', async () => {
		const storage = fakeStorage()
		const { model, wrapper } = mountRoadmapModel({ data, storage })
		await flushPromises()
		await model.setTopicStatus('a', 'done')
		await wrapper.setProps({ storage: null })
		await vi.advanceTimersByTimeAsync(300)
		expect(storage.save).not.toHaveBeenCalled()
	})

	it('прогресс из пропса (v-model) тоже сохраняется', async () => {
		const storage = fakeStorage()
		const { wrapper } = mountRoadmapModel({ data, storage })
		await flushPromises()
		await wrapper.setProps({ progress: progressOf({ c: { status: 'done' } }) })
		await vi.advanceTimersByTimeAsync(300)
		expect(storage.save).toHaveBeenCalledOnce()
	})
})

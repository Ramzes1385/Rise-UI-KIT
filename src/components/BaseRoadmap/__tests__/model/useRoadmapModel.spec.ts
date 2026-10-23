import { mountRoadmapModel } from './fixtures/mountRoadmapModel'
import { progressOf, roadmap, stage, topic } from './fixtures/roadmapFixtures'

const data = roadmap([
	stage('s1', [topic('a', { hours: 2 }), topic('b', { hours: 3, choice: 'g' }), topic('c', { hours: 1, choice: 'g' })]),
	stage('s2', [topic('d', { kind: 'optional', hours: 4 }), topic('e', { requires: ['a'] })], { requires: ['s1'] }),
	stage('s3', [topic('f')]),
])

afterEach(() => {
	vi.restoreAllMocks()
})

describe('useRoadmapModel: сводка и данные', () => {
	it('отдаёт данные, индекс и сводку', () => {
		const { model } = mountRoadmapModel({ data })
		expect(model.data.value).toEqual(data)
		expect(model.index.value.topics.size).toBe(6)
		expect(model.summary.value).toEqual({ done: 0, total: 6, percent: 0, hoursLeft: 3, continueTopicId: 'a' })
		expect(model.issues.value).toEqual([])
	})

	it('смена data в пропсах обновляет всё', async () => {
		const { model, wrapper } = mountRoadmapModel({ data })
		await wrapper.setProps({ data: roadmap([stage('x', [topic('y')])]) })
		expect([...model.index.value.topics.keys()]).toEqual(['y'])
		expect(model.summary.value.total).toBe(1)
	})

	it('сводка и доля пути растут вместе с прогрессом', async () => {
		const { model } = mountRoadmapModel({ data })
		await model.setTopicStatus('a', 'done')
		await model.setTopicStatus('b', 'done')
		expect(model.summary.value).toMatchObject({ done: 2, percent: 33, hoursLeft: 0, continueTopicId: 'e' })
		expect(model.pathProgress.value).toBeCloseTo(1 / 3)
	})

	it('getTopicState: состояние темы или null для неизвестной', () => {
		const { model } = mountRoadmapModel({ data })
		expect(model.getTopicState('e')).toMatchObject({ status: 'locked', missing: ['a', 's1'] })
		expect(model.getTopicState('ghost')).toBeNull()
	})

	it('isBusy у вида темы берётся из busyTopics, пока хук ждёт Promise', async () => {
		let resolve: (value: boolean) => void = () => undefined
		const { model } = mountRoadmapModel({ data, beforeStatusChange: () => new Promise<boolean>(done => (resolve = done)) })
		const busyIds = () =>
			model.stageViews.value
				.flatMap(stage => stage.topics)
				.filter(view => view.isBusy)
				.map(view => view.topic.id)
		expect(busyIds()).toEqual([])
		const pending = model.setTopicStatus('a', 'done')
		expect(busyIds()).toEqual(['a'])
		resolve(true)
		await pending
		expect(busyIds()).toEqual([])
	})

	it('statuses и busyTopics доступны', () => {
		const { model } = mountRoadmapModel({ data })
		expect(model.statuses.value.currentStageId).toBe('s1')
		expect(model.busyTopics.value.size).toBe(0)
	})
})

describe('useRoadmapModel: предупреждения о данных', () => {
	const broken = roadmap([stage('s', [topic('a', { requires: ['ghost'] })])])

	it('при создании пишет предупреждение в разработке и отдаёт issues', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { model } = mountRoadmapModel({ data: broken })
		expect(model.issues.value).toEqual([{ code: 'UNKNOWN_REQUIRE', params: { id: 'a', target: 'ghost' } }])
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('ghost'))
	})

	it('при смене data предупреждает заново; чистые данные молчат', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { wrapper } = mountRoadmapModel({ data })
		expect(warn).not.toHaveBeenCalled()
		await wrapper.setProps({ data: broken })
		expect(warn).toHaveBeenCalledTimes(1)
		await wrapper.setProps({ data })
		expect(warn).toHaveBeenCalledTimes(1)
	})

	it('несуществующее требование не блокирует тему', () => {
		vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { model } = mountRoadmapModel({ data: broken })
		expect(model.getTopicState('a')?.status).toBe('available')
	})
})

describe('useRoadmapModel: раскрытие этапов', () => {
	it('по умолчанию раскрыт текущий этап', () => {
		const { model } = mountRoadmapModel({ data })
		expect(model.expandedIds.value).toEqual(['s1'])
	})

	it('когда всё пройдено, ничего не раскрыто', () => {
		const only = roadmap([stage('s', [topic('a')])])
		const { model } = mountRoadmapModel({ data: only, progress: progressOf({ a: { status: 'done' } }) })
		expect(model.expandedIds.value).toEqual([])
	})

	it('expandStage: раскрывает, сворачивает, переключает; update:expanded', () => {
		const { model, emitted } = mountRoadmapModel({ data })
		model.expandStage('s2')
		expect(model.expandedIds.value).toEqual(['s1', 's2'])
		model.expandStage('s1')
		expect(model.expandedIds.value).toEqual(['s2'])
		model.expandStage('s2', false)
		expect(model.expandedIds.value).toEqual([])
		model.expandStage('s3', true)
		expect(emitted('update:expanded')).toEqual([[['s1', 's2']], [['s2']], [[]], [['s3']]])
	})

	it('expandStage: уже в нужном состоянии и неизвестный этап — ничего не происходит', () => {
		const { model, emitted } = mountRoadmapModel({ data })
		model.expandStage('s1', true)
		model.expandStage('s2', false)
		model.expandStage('ghost')
		expect(emitted('update:expanded')).toEqual([])
	})

	it('expandAll и collapseAll', () => {
		const { model, emitted } = mountRoadmapModel({ data })
		model.expandAll()
		expect(model.expandedIds.value).toEqual(['s1', 's2', 's3'])
		model.collapseAll()
		expect(model.expandedIds.value).toEqual([])
		expect(emitted('update:expanded')).toEqual([[['s1', 's2', 's3']], [[]]])
	})

	it('v-model:expanded: пропс задаёт раскрытые этапы и обновляется снаружи', async () => {
		const { model, wrapper } = mountRoadmapModel({ data, expanded: ['s3'] })
		expect(model.expandedIds.value).toEqual(['s3'])
		await wrapper.setProps({ expanded: ['s2'] })
		expect(model.expandedIds.value).toEqual(['s2'])
	})
})

describe('useRoadmapModel: выбор темы и фильтр', () => {
	it('selectTopic выбирает тему: selectedTopic, update:selected и select', () => {
		const { model, emitted } = mountRoadmapModel({ data })
		model.selectTopic('b')
		expect(model.selectedId.value).toBe('b')
		expect(model.selectedTopic.value).toBe(model.index.value.topics.get('b')?.topic)
		expect(emitted('update:selected')).toEqual([['b']])
		expect(emitted('select')).toHaveLength(1)
		expect((emitted('select')[0][0] as { id: string }).id).toBe('b')
	})

	it('повторный выбор той же темы — без событий; null и неизвестный id снимают выбор', () => {
		const { model, emitted } = mountRoadmapModel({ data })
		model.selectTopic('b')
		model.selectTopic('b')
		expect(emitted('update:selected')).toHaveLength(1)
		model.selectTopic('ghost')
		expect(model.selectedId.value).toBeNull()
		expect(model.selectedTopic.value).toBeNull()
		expect(emitted('update:selected')).toEqual([['b'], [null]])
		expect(emitted('select')[1]).toEqual([null])
		model.selectTopic(null)
		expect(emitted('update:selected')).toHaveLength(2)
	})

	it('selected из пропса; смена пропса переносится', async () => {
		const { model, wrapper } = mountRoadmapModel({ data, selected: 'c' })
		expect(model.selectedTopic.value?.id).toBe('c')
		await wrapper.setProps({ selected: null })
		expect(model.selectedId.value).toBeNull()
	})

	it('фильтр по умолчанию all; setFilter меняет и шлёт update:filter, то же значение — нет', async () => {
		const { model, emitted } = mountRoadmapModel({ data })
		expect(model.filter.value).toBe('all')
		model.setFilter('all')
		expect(emitted('update:filter')).toEqual([])
		model.setFilter('optional')
		expect(model.filter.value).toBe('optional')
		expect(emitted('update:filter')).toEqual([['optional']])
	})

	it('filter из пропса', async () => {
		const { model, wrapper } = mountRoadmapModel({ data, filter: 'required' })
		expect(model.filter.value).toBe('required')
		await wrapper.setProps({ filter: 'optional' })
		expect(model.filter.value).toBe('optional')
	})
})

describe('useRoadmapModel: continueLearning', () => {
	it('раскрывает этап темы и выбирает её', async () => {
		const { model } = mountRoadmapModel({ data })
		await model.setTopicStatus('a', 'done')
		await model.setTopicStatus('b', 'done')
		model.collapseAll()
		model.continueLearning()
		expect(model.selectedId.value).toBe('e')
		expect(model.expandedIds.value).toEqual(['s2'])
	})

	it('когда продолжать нечего — ничего не происходит', () => {
		const only = roadmap([stage('s', [topic('a')])])
		const { model, order } = mountRoadmapModel({ data: only, progress: progressOf({ a: { status: 'done' } }) })
		model.continueLearning()
		expect(order).toEqual([])
		expect(model.selectedId.value).toBeNull()
	})
})

describe('useRoadmapModel: stageViews', () => {
	it('считает номер, статус, done/total/hours, раскрытость и id для aria', () => {
		const { model } = mountRoadmapModel({ data, progress: progressOf({ a: { status: 'done' } }), expanded: ['s2'] })
		const [first, second, third] = model.stageViews.value
		expect(first).toMatchObject({ index: 0, status: 'current', done: 1, total: 3, hours: 6, isExpanded: false })
		expect(second).toMatchObject({ index: 1, status: 'locked', done: 0, total: 2, hours: 4, isExpanded: true })
		expect(third).toMatchObject({ index: 2, status: 'available', total: 1, hours: 0 })
		expect(first.headingId).toMatch(/-stage-0-heading$/)
		expect(first.panelId).toMatch(/-stage-0-panel$/)
		expect(second.panelId).toMatch(/-stage-1-panel$/)
		expect(new Set(model.stageViews.value.flatMap(view => [view.headingId, view.panelId])).size).toBe(6)
	})

	it('темы: состояние, выбор и «Альтернатива» — вторая и далее тема группы choice', () => {
		const { model } = mountRoadmapModel({ data, selected: 'c' })
		const topics = model.stageViews.value[0].topics
		expect(topics.map(view => view.isAlternative)).toEqual([false, false, true])
		expect(topics.map(view => view.isSelected)).toEqual([false, false, true])
		expect(topics[0].state).toEqual(model.getTopicState('a'))
	})

	it('фильтр required приглушает optional-темы, optional — обязательные, all — никого', async () => {
		const { model } = mountRoadmapModel({ data })
		const filtered = () => model.stageViews.value[1].topics.map(view => view.isFiltered)
		expect(filtered()).toEqual([false, false])
		model.setFilter('required')
		await Promise.resolve()
		expect(filtered()).toEqual([true, false])
		model.setFilter('optional')
		await Promise.resolve()
		expect(filtered()).toEqual([false, true])
	})

	it('повторный id: вид повторной темы и этапа показывает состояние первого вхождения', () => {
		vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const dup = roadmap([stage('s', [topic('a'), topic('a', { hours: 1 })]), stage('s', [topic('b')])])
		const { model } = mountRoadmapModel({ data: dup })
		const [first, second] = model.stageViews.value
		expect(first.topics[1].state).toEqual(first.topics[0].state)
		expect(second.status).toBe(first.status)
	})

	it('selected с неизвестным id из пропсов: темы нет, выбор снимается при следующем выборе', () => {
		const { model } = mountRoadmapModel({ data, selected: 'ghost' })
		expect(model.selectedTopic.value).toBeNull()
		expect(model.stageViews.value.flatMap(view => view.topics).some(view => view.isSelected)).toBe(false)
	})

	it('pathProgress считается по этапам', async () => {
		const only = roadmap([stage('s1', [topic('a')]), stage('s2', [topic('b'), topic('c')])])
		const { model } = mountRoadmapModel({ data: only })
		expect(model.pathProgress.value).toBe(0)
		await model.setTopicStatus('a', 'done')
		await model.setTopicStatus('b', 'done')
		expect(model.pathProgress.value).toBeCloseTo(0.75)
	})
})

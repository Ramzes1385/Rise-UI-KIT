import { vi } from 'vitest'
import { mountEdit, roadmap, stage, topic } from '../fixtures/editFixtures'
import { useRoadmapInspector } from '../../../model/edit/sortable/useRoadmapInspector'

function setup(props?: Parameters<typeof mountEdit>[0]) {
	const mounted = mountEdit(props)
	return { ...mounted, inspector: useRoadmapInspector(mounted.edit) }
}

afterEach(() => {
	vi.useRealTimers()
})

const topicOf = (data: ReturnType<typeof mountEdit>['data'], id: string) =>
	data.value.stages.flatMap(item => item.topics).find(item => item.id === id)

describe('useRoadmapInspector: выбор', () => {
	it('без выбора ничего нет, правка возвращает false', async () => {
		const { inspector, edit } = setup()
		expect(inspector.topic.value).toBeNull()
		expect(inspector.stage.value).toBeNull()
		expect(inspector.owner.value).toBeNull()
		expect(inspector.canBeAlternative.value).toBe(false)
		expect(await inspector.setTitle('x')).toBe(false)
		expect(edit.history.list()).toEqual([])
	})

	it('select выбирает тему, этап и возвращает на первую вкладку', () => {
		const { inspector } = setup()
		inspector.select('b')
		inspector.setTab('hooks')
		expect(inspector.tab.value).toBe('hooks')
		expect(inspector.topic.value?.id).toBe('b')
		expect(inspector.owner.value?.id).toBe('s1')
		expect(inspector.stage.value).toBeNull()
		expect(inspector.canBeAlternative.value).toBe(true)
		inspector.select('s2')
		expect(inspector.tab.value).toBe('topic')
		expect(inspector.stage.value?.id).toBe('s2')
		expect(inspector.topic.value).toBeNull()
		inspector.select('a')
		expect(inspector.canBeAlternative.value).toBe(false)
		inspector.select(null)
		expect(inspector.targetId.value).toBeNull()
	})

	it('варианты «Нужно знать»: без себя, с путём этап · тема, замыкающие цикл отключены', () => {
		const { inspector } = setup()
		inspector.select('a')
		const options = inspector.requireOptions.value
		expect(options.find(item => item.value === 'a')).toBeUndefined()
		expect(options.find(item => item.value === 'b')).toMatchObject({ label: 'Этап s1 · Тема b', isDisabled: true })
		expect(options.find(item => item.value === 's1')).toMatchObject({ label: 'Этап s1', isDisabled: true })
		expect(options.find(item => item.value === 'd')).toMatchObject({ isDisabled: true })
		expect(options.find(item => item.value === 's3')).toMatchObject({ isDisabled: false })
		inspector.select(null)
		expect(inspector.requireOptions.value.every(item => item.isDisabled === false)).toBe(true)
	})
})

describe('useRoadmapInspector: правка полей', () => {
	it('название: подряд идущие правки склеиваются в один шаг, отмена возвращает исходное', async () => {
		vi.useFakeTimers({ toFake: ['Date', 'performance'] })
		const { inspector, edit, data } = setup()
		inspector.select('a')
		await inspector.setTitle('Н')
		await inspector.setTitle('Но')
		await inspector.setTitle('Нов')
		expect(topicOf(data, 'a')?.title).toBe('Нов')
		expect(edit.history.list()).toHaveLength(1)
		edit.undo()
		expect(topicOf(data, 'a')?.title).toBe('Тема a')
	})

	it('описание: пустая строка убирает поле; часы: null убирает поле', async () => {
		const { inspector, data } = setup()
		inspector.select('a')
		await inspector.setDescription('Текст')
		expect(topicOf(data, 'a')?.description).toBe('Текст')
		await inspector.setDescription('')
		expect(topicOf(data, 'a')?.description).toBeUndefined()
		await inspector.setHours(5)
		expect(topicOf(data, 'a')?.hours).toBe(5)
		await inspector.setHours(null)
		expect(topicOf(data, 'a')?.hours).toBeUndefined()
	})

	it('статус по умолчанию: один шаг истории, undo возвращает поле, undefined убирает', async () => {
		const { inspector, edit, data } = setup()
		inspector.select('c')
		expect(await inspector.setDefaultStatus('done')).toBe(true)
		expect(topicOf(data, 'c')?.defaultStatus).toBe('done')
		expect(edit.history.list()).toHaveLength(1)
		edit.undo()
		expect(topicOf(data, 'c')).not.toHaveProperty('defaultStatus')
		edit.redo()
		expect(topicOf(data, 'c')?.defaultStatus).toBe('done')
		await inspector.setDefaultStatus(undefined)
		expect(topicOf(data, 'c')).not.toHaveProperty('defaultStatus')
		expect(edit.history.list()).toHaveLength(2)
	})

	it('необязательность, связи и перенос в другой этап', async () => {
		const { inspector, data } = setup()
		inspector.select('c')
		await inspector.setOptional(true)
		expect(topicOf(data, 'c')?.kind).toBe('optional')
		await inspector.setOptional(false)
		expect(topicOf(data, 'c')?.kind).toBeUndefined()
		await inspector.setRequires(['a', 'b'])
		expect(topicOf(data, 'c')?.requires).toEqual(['a', 'b'])
		await inspector.setRequires([])
		expect(topicOf(data, 'c')?.requires).toBeUndefined()
		await inspector.moveToStage('s3')
		expect(data.value.stages[2].topics.map(item => item.id)).toEqual(['c'])
	})

	it('альтернатива включается и выключается', async () => {
		const { inspector, data } = setup()
		inspector.select('b')
		await inspector.setAlternative(true)
		expect(topicOf(data, 'a')?.choice).toBe('choice-s1')
		expect(topicOf(data, 'b')?.choice).toBe('choice-s1')
		await inspector.setAlternative(false)
		expect(topicOf(data, 'a')?.choice).toBeUndefined()
		expect(topicOf(data, 'b')?.choice).toBeUndefined()
	})

	it('подтемы: добавить, переименовать, удалить (пустой список убирает поле)', async () => {
		const { inspector, data } = setup()
		inspector.select('a')
		await inspector.addSubtopic()
		await inspector.addSubtopic()
		expect(topicOf(data, 'a')?.subtopics?.map(item => item.id)).toEqual(['s1', 's2'])
		await inspector.renameSubtopic('s2', 'Вторая')
		expect(topicOf(data, 'a')?.subtopics?.[1].title).toBe('Вторая')
		await inspector.removeSubtopic('s1')
		await inspector.removeSubtopic('s2')
		expect(topicOf(data, 'a')?.subtopics).toBeUndefined()
	})

	it('материалы: добавить, изменить, удалить', async () => {
		const { inspector, data } = setup()
		inspector.select('a')
		await inspector.addMaterial('video')
		await inspector.updateMaterial(0, { title: 'Лекция', url: 'https://x.dev' })
		expect(topicOf(data, 'a')?.materials).toEqual([{ title: 'Лекция', kind: 'video', url: 'https://x.dev' }])
		await inspector.removeMaterial(0)
		expect(topicOf(data, 'a')?.materials).toBeUndefined()
	})

	it('remove удаляет выбранный элемент', async () => {
		const { inspector, data } = setup({ data: roadmap([stage('s', [topic('a'), topic('b')])]) })
		inspector.select('a')
		await inspector.remove()
		expect(data.value.stages[0].topics.map(item => item.id)).toEqual(['b'])
		vi.restoreAllMocks()
	})
})

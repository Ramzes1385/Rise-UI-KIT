import { mountRoadmapModel } from '../fixtures/mountRoadmapModel'
import { progressOf, roadmap, stage, statusesOf, topic } from '../fixtures/roadmapFixtures'

describe('defaultStatus: статус темы, пока у неё нет своего в прогрессе', () => {
	it('без поля поведение как в фазе 1: тема доступна', () => {
		const data = roadmap([stage('s', [topic('a')])])
		expect(statusesOf(data).topics.get('a')?.status).toBe('available')
		const withUndefined = roadmap([stage('s', [topic('a', { defaultStatus: undefined })])])
		expect(statusesOf(withUndefined).topics.get('a')).toEqual(statusesOf(data).topics.get('a'))
	})

	it.each(['in-progress', 'skipped', 'done'] as const)('значение «%s» применяется к теме без прогресса', value => {
		const data = roadmap([stage('s', [topic('a', { defaultStatus: value })])])
		expect(statusesOf(data).topics.get('a')?.status).toBe(value)
	})

	it('своё значение в прогрессе сильнее поля', () => {
		const data = roadmap([stage('s', [topic('a', { defaultStatus: 'done' })])])
		expect(statusesOf(data, progressOf({ a: { status: 'in-progress' } })).topics.get('a')?.status).toBe('in-progress')
		expect(statusesOf(data, progressOf({ a: { status: 'skipped' } })).topics.get('a')?.status).toBe('skipped')
	})

	it('закрытость сильнее поля: пока требования не выполнены, тема locked', () => {
		const data = roadmap([stage('s', [topic('a'), topic('b', { requires: ['a'], defaultStatus: 'done' })])])
		expect(statusesOf(data).topics.get('b')).toMatchObject({ status: 'locked', missing: ['a'] })
		expect(statusesOf(data, progressOf({ a: { status: 'done' } })).topics.get('b')?.status).toBe('done')
	})

	it('done по умолчанию открывает зависимые темы и закрывает этап', () => {
		const data = roadmap([
			stage('s1', [topic('a', { defaultStatus: 'done' })]),
			stage('s2', [topic('b', { requires: ['a'] })], { requires: ['s1'] }),
		])
		const statuses = statusesOf(data)
		expect(statuses.topics.get('b')?.status).toBe('available')
		expect(statuses.stages.get('s1')).toBe('done')
		expect(statuses.stages.get('s2')).toBe('current')
		expect(statuses.currentStageId).toBe('s2')
	})

	it('skipped по умолчанию тоже засчитывается как пройденная', () => {
		const data = roadmap([stage('s', [topic('a', { defaultStatus: 'skipped' }), topic('b', { requires: ['a'] })])])
		expect(statusesOf(data).topics.get('b')?.status).toBe('available')
	})

	it('in-progress по умолчанию не открывает зависимые темы', () => {
		const data = roadmap([stage('s', [topic('a', { defaultStatus: 'in-progress' }), topic('b', { requires: ['a'] })])])
		expect(statusesOf(data).topics.get('b')?.status).toBe('locked')
	})
})

describe('defaultStatus в модели', () => {
	const data = roadmap([stage('s', [topic('a', { defaultStatus: 'done' }), topic('b')])])

	it('сводка и getTopicState учитывают поле', () => {
		const { model } = mountRoadmapModel({ data })
		expect(model.getTopicState('a')?.status).toBe('done')
		expect(model.summary.value).toMatchObject({ done: 1, total: 2, percent: 50 })
	})

	it('отметка в прогрессе переопределяет поле, снятие отметки возвращает его', async () => {
		const { model } = mountRoadmapModel({ data })
		await model.setTopicStatus('a', 'in-progress')
		expect(model.getTopicState('a')?.status).toBe('in-progress')
		await model.setTopicStatus('a', null)
		expect(model.getTopicState('a')?.status).toBe('done')
	})
})

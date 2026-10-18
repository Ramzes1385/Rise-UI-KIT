import { stageView, topicView } from '../fixtures/shellFixtures'
import { legendItems } from '../../model/view/format/roadmapLegend'
import { flattenTopics, nextTopicId } from '../../model/view/format/roadmapOrder'
import { firstUnmetTitle, resolveRequirements, titlesOf } from '../../model/view/format/roadmapRequirements'

const stages = [
	stageView({
		id: 's1',
		title: 'Основы',
		status: 'done',
		topics: [topicView({ id: 'a', title: 'A', status: 'done' }), topicView({ id: 'b', title: 'B', status: 'skipped' })],
	}),
	stageView({
		id: 's2',
		title: 'Дальше',
		status: 'current',
		index: 1,
		topics: [
			topicView({ id: 'c', title: 'C', status: 'available' }),
			topicView({ id: 'd', title: 'D', status: 'locked' }),
			topicView({ id: 'e', title: 'E', status: 'in-progress' }),
		],
	}),
	stageView({ id: 's3', title: 'Закрыт', status: 'locked', index: 2, topics: [topicView({ id: 'f', title: 'F', status: 'locked' })] }),
	stageView({ id: 's4', title: 'Свободный', status: 'available', index: 3, topics: [] }),
]

describe('roadmapLegend', () => {
	it('четыре статуса с подписями и долей кольца', () => {
		expect(legendItems().map(item => [item.status, item.fraction, item.label])).toEqual([
			['done', 1, 'Изучена'],
			['in-progress', 0.25, 'В процессе'],
			['available', 0, 'Доступна'],
			['locked', 0, 'Закрыта'],
		])
	})
})

describe('roadmapOrder', () => {
	it('flattenTopics выстраивает темы всех этапов подряд с этапом', () => {
		expect(flattenTopics(stages).map(item => `${item.stage.stage.id}:${item.view.topic.id}`)).toEqual([
			's1:a',
			's1:b',
			's2:c',
			's2:d',
			's2:e',
			's3:f',
		])
	})

	it('следующая тема пропускает изученные, закрытые и пропущенные', () => {
		expect(nextTopicId(stages, 'a')).toBe('c')
		expect(nextTopicId(stages, 'c')).toBe('e')
	})

	it('после последней идёт круг сначала', () => {
		expect(nextTopicId(stages, 'e')).toBe('c')
	})

	it('неизвестная тема и отсутствие других доступных — null', () => {
		expect(nextTopicId(stages, 'zzz')).toBeNull()
		expect(nextTopicId([stageView({ topics: [topicView({ id: 'only' })] })], 'only')).toBeNull()
		expect(nextTopicId([], 'a')).toBeNull()
	})
})

describe('roadmapRequirements', () => {
	it('resolveRequirements: нет требований — пусто', () => {
		expect(resolveRequirements(undefined, stages)).toEqual([])
	})

	it('находит темы и этапы, неизвестные id отбрасывает', () => {
		expect(resolveRequirements(['c', 'zzz', 's1'], stages)).toEqual([
			{ id: 'c', title: 'C', status: 'available', isStage: false },
			{ id: 's1', title: 'Основы', status: 'done', isStage: true },
		])
	})

	it('статус этапа переводится в статус темы', () => {
		expect(resolveRequirements(['s1', 's2', 's3', 's4'], stages).map(item => item.status)).toEqual([
			'done',
			'in-progress',
			'locked',
			'available',
		])
	})

	it('titlesOf возвращает названия', () => {
		expect(titlesOf(['a', 's2'], stages)).toEqual(['A', 'Дальше'])
	})

	it('firstUnmetTitle: первое непройденное; изученное и пропущенное проходят', () => {
		expect(firstUnmetTitle(['a', 'b', 'd', 'e'], stages)).toBe('D')
		expect(firstUnmetTitle(['a', 'b'], stages)).toBeUndefined()
		expect(firstUnmetTitle(undefined, stages)).toBeUndefined()
	})
})

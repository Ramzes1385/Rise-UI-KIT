import { stageView, topicView } from '../fixtures/viewFixtures'
import { computePathLayout } from '../../../model/layout/pathLayout'
import type { RoadmapStageView } from '../../../types/internal/roadmapInternal.types'
import { buildStageItems, collectRequirementLinks } from '../../../model/layout/roadmapLayoutItems'

function geometryOf(stages: RoadmapStageView[]) {
	return computePathLayout(
		stages.map(view => ({ topics: view.topics.length, isExpanded: view.isExpanded })),
		{ isRtl: false },
	)
}

function sample(): RoadmapStageView[] {
	return [
		stageView({
			id: 'basics',
			title: 'Основы',
			index: 0,
			status: 'current',
			isExpanded: true,
			topics: [topicView({ id: 'html', title: 'HTML' }), topicView({ id: 'css', title: 'CSS', topic: { requires: ['html'] } })],
		}),
		stageView({
			id: 'frameworks',
			title: 'Фреймворки',
			index: 1,
			status: 'locked',
			requires: ['css', 'basics'],
			topics: [topicView({ id: 'vue', title: 'Vue', status: 'locked', missing: ['css', 'ghost'] })],
		}),
	]
}

describe('buildStageItems', () => {
	it('собирает темы только у раскрытых этапов', () => {
		const stages = sample()
		const items = buildStageItems(stages, geometryOf(stages))
		expect(items).toHaveLength(2)
		expect(items[0].topics.map(topic => topic.view.topic.id)).toEqual(['html', 'css'])
		expect(items[1].topics).toEqual([])
	})

	it('кладёт в стиль положение и номер: --rl-x, --rl-y, --rl-i', () => {
		const stages = sample()
		const geometry = geometryOf(stages)
		const [first, second] = buildStageItems(stages, geometry)
		expect(first.style).toEqual({ '--rl-x': geometry.stages[0].box.x, '--rl-y': geometry.stages[0].box.y, '--rl-i': 0 })
		expect(second.style['--rl-i']).toBe(1)
		expect(first.topics[1].style).toEqual({
			'--rl-x': geometry.stages[0].topics[1].box.x,
			'--rl-y': geometry.stages[0].topics[1].box.y,
			'--rl-i': 1,
		})
		expect(first.topics[1].slot).toBe(geometry.stages[0].topics[1])
	})

	it('missing — названия невыполненных требований темы, неизвестные пропускаются', () => {
		const stages = sample()
		stages[1] = { ...stages[1], isExpanded: true }
		const items = buildStageItems(stages, geometryOf(stages))
		expect(items[1].topics[0].missing).toEqual(['CSS'])
	})

	it('unlockTitle — первое не пройденное требование этапа', () => {
		const stages = sample()
		const [first, second] = buildStageItems(stages, geometryOf(stages))
		expect(first.unlockTitle).toBeUndefined()
		expect(second.unlockTitle).toBe('CSS')
	})

	it('пройденные требования в unlockTitle не попадают', () => {
		const stages = sample()
		stages[0] = { ...stages[0], topics: [topicView({ id: 'html' }), topicView({ id: 'css', status: 'done' })] }
		expect(buildStageItems(stages, geometryOf(stages))[1].unlockTitle).toBe('Основы')
	})
})

describe('collectRequirementLinks', () => {
	function withSelected(stages: RoadmapStageView[], topicId: string): RoadmapStageView[] {
		return stages.map(view => ({
			...view,
			topics: view.topics.map(topic => ({ ...topic, isSelected: topic.topic.id === topicId })),
		}))
	}

	it('без выбранной темы связей нет', () => {
		expect(collectRequirementLinks(sample())).toEqual([])
	})

	it('выбранная тема раскрытого этапа связана с требованием-темой', () => {
		expect(collectRequirementLinks(withSelected(sample(), 'css'))).toEqual([
			{ from: { stage: 0, topic: 0 }, to: { stage: 0, topic: 1 } },
		])
	})

	it('требование-этап указывает на сам этап', () => {
		const stages = sample()
		stages[1] = {
			...stages[1],
			isExpanded: true,
			topics: [topicView({ id: 'vue', isSelected: true, topic: { requires: ['basics', 'css'] } })],
		}
		expect(collectRequirementLinks(stages)).toEqual([
			{ from: { stage: 0, topic: null }, to: { stage: 1, topic: 0 } },
			{ from: { stage: 0, topic: 1 }, to: { stage: 1, topic: 0 } },
		])
	})

	it('неизвестное требование и тема свёрнутого этапа пропускаются', () => {
		const stages = sample()
		stages[0] = {
			...stages[0],
			topics: [topicView({ id: 'html', isSelected: true, topic: { requires: ['ghost', 'vue'] } })],
		}
		expect(collectRequirementLinks(stages)).toEqual([])
	})

	it('выбранная тема свёрнутого этапа связей не даёт', () => {
		const stages = sample()
		stages[1] = { ...stages[1], topics: [topicView({ id: 'vue', isSelected: true, topic: { requires: ['css'] } })] }
		expect(collectRequirementLinks(stages)).toEqual([])
	})

	it('тема без requires не даёт связей', () => {
		expect(collectRequirementLinks(withSelected(sample(), 'html'))).toEqual([])
	})
})

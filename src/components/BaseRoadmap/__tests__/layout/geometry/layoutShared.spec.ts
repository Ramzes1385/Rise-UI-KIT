import type { RoadmapLayoutGeometry, RoadmapSegment, RoadmapSpine } from '../../../types/internal/roadmapLayout.types'
import {
	buildRequirementLinks,
	createMirror,
	emptyGeometry,
	finishSpine,
	roundCoord,
	segmentsToPath,
	solidFraction,
	stackHeight,
	stackTopics,
	stageBox,
	stageSlot,
} from '../../../model/layout/layoutShared'

const identity = createMirror(100, false)

function geometryOf(boxes: { x: number; y: number }[][]): RoadmapLayoutGeometry {
	const stages = boxes.map((group, index) => {
		const [card, ...topics] = group
		return stageSlot(
			{ ...card, width: 228, height: 54 },
			index,
			topics.map((topic, topicIndex) => ({
				index: topicIndex,
				box: { ...topic, width: 200, height: 34 },
				side: 'end' as const,
				branch: '',
			})),
		)
	})
	return { ...emptyGeometry(500), stages }
}

describe('layoutShared', () => {
	it('округляет координаты до сотых', () => {
		expect(roundCoord(1.23456)).toBe(1.23)
		expect(roundCoord(-0.004)).toBe(-0)
	})

	it('createMirror: в LTR оставляет x, в RTL отражает от ширины', () => {
		expect(createMirror(100, false)(30.456)).toBe(30.46)
		expect(createMirror(100, true)(30)).toBe(70)
		expect(createMirror(100, true)(0)).toBe(100)
	})

	it('stageBox ставит карточку 228 × 54 вокруг центра', () => {
		const box = stageBox({ x: 200, y: 100 })
		expect(box).toEqual({ x: 86, y: 73, width: 228, height: 54 })
	})

	it('segmentsToPath пишет M, L и C и применяет зеркало к каждой точке', () => {
		const segments: RoadmapSegment[] = [
			{ kind: 'L', to: { x: 10, y: 20 } },
			{ kind: 'C', control1: { x: 20, y: 20 }, control2: { x: 30, y: 40 }, to: { x: 40, y: 40 } },
		]
		expect(segmentsToPath({ x: 0, y: 0 }, segments, identity)).toBe('M0 0 L10 20 C20 20, 30 40, 40 40')
		expect(segmentsToPath({ x: 0, y: 0 }, segments, createMirror(100, true))).toBe('M100 0 L90 20 C80 20, 70 40, 60 40')
	})

	describe('finishSpine', () => {
		it('считает доли длины по остановкам и пишет путь', () => {
			const spine: RoadmapSpine = {
				start: { x: 0, y: 0 },
				segments: [
					{ kind: 'L', to: { x: 10, y: 0 } },
					{ kind: 'L', to: { x: 10, y: 10 } },
					{ kind: 'L', to: { x: 10, y: 40 } },
				],
				stops: [0, 1, 2],
			}
			const result = finishSpine(spine, identity)
			expect(result.d).toBe('M0 0 L10 0 L10 10 L10 40')
			expect(result.fractions).toEqual([0.2, 0.4, 1])
		})

		it('длину кубической кривой считает по 24 хордам: прямая кривая даёт точную длину', () => {
			const spine: RoadmapSpine = {
				start: { x: 0, y: 0 },
				segments: [
					{ kind: 'C', control1: { x: 3, y: 0 }, control2: { x: 6, y: 0 }, to: { x: 9, y: 0 } },
					{ kind: 'L', to: { x: 9, y: 9 } },
				],
				stops: [0, 1],
			}
			const [first, second] = finishSpine(spine, identity).fractions
			expect(first).toBe(0.5)
			expect(second).toBe(1)
		})

		it('зеркалит путь, не меняя доли', () => {
			const spine: RoadmapSpine = { start: { x: 0, y: 0 }, segments: [{ kind: 'L', to: { x: 10, y: 0 } }], stops: [0] }
			const result = finishSpine(spine, createMirror(100, true))
			expect(result.d).toBe('M100 0 L90 0')
			expect(result.fractions).toEqual([1])
		})

		it('нулевая длина пути даёт нулевые доли', () => {
			const spine: RoadmapSpine = { start: { x: 5, y: 5 }, segments: [{ kind: 'L', to: { x: 5, y: 5 } }], stops: [0] }
			expect(finishSpine(spine, identity).fractions).toEqual([0])
		})

		it('путь без звеньев — пустые доли', () => {
			expect(finishSpine({ start: { x: 0, y: 0 }, segments: [], stops: [] }, identity)).toEqual({ d: 'M0 0', fractions: [] })
		})
	})

	describe('solidFraction', () => {
		const fractions = [0.2, 0.6, 1]

		it.each([
			{ progress: 0, expected: 0.2 },
			{ progress: 1, expected: 1 },
			{ progress: 0.5, expected: 0.6 },
			{ progress: 0.25, expected: 0.4 },
			{ progress: 0.75, expected: 0.8 },
			{ progress: -3, expected: 0.2 },
			{ progress: 7, expected: 1 },
		])('прогресс $progress → доля $expected', ({ progress, expected }) => {
			expect(solidFraction(progress, fractions)).toBe(expected)
		})

		it('меньше двух долей — 0', () => {
			expect(solidFraction(0.5, [0.4])).toBe(0)
			expect(solidFraction(0.5, [])).toBe(0)
		})
	})

	it('emptyGeometry: нулевая высота, без этапов, точки по центру ширины', () => {
		expect(emptyGeometry(300)).toEqual({
			width: 300,
			height: 0,
			stages: [],
			spine: '',
			fractions: [],
			start: { x: 150, y: 0 },
			goal: { x: 150, y: 0 },
		})
	})

	it.each([
		{ count: 0, expected: 0 },
		{ count: 1, expected: 34 },
		{ count: 2, expected: 74 },
		{ count: 7, expected: 274 },
	])('stackHeight($count) = $expected', ({ count, expected }) => {
		expect(stackHeight(count)).toBe(expected)
	})

	describe('stackTopics', () => {
		const card = { x: 10, y: 20, width: 228, height: 54 }

		it('без тем — пустой список', () => {
			expect(stackTopics(card, 0, identity)).toEqual([])
		})

		it('ставит темы столбцом под карточкой с шагом 40 и отступом 32', () => {
			const [first, second] = stackTopics(card, 2, identity)
			expect(first.box).toEqual({ x: 42, y: 90, width: 196, height: 34 })
			expect(second.box).toEqual({ x: 42, y: 130, width: 196, height: 34 })
			expect(first.side).toBe('below')
			expect(second.index).toBe(1)
		})

		it('первая ветка идёт от низа карточки, остальные от предыдущей темы', () => {
			const [first, second] = stackTopics(card, 2, identity)
			expect(first.branch.startsWith('M26 74 L26 95')).toBe(true)
			expect(second.branch.startsWith('M26 107 L26 135')).toBe(true)
		})

		it('зеркалит ветки, не трогая боксы', () => {
			const mirror = createMirror(300, true)
			const [topic] = stackTopics(card, 1, mirror)
			expect(topic.box.x).toBe(42)
			expect(topic.branch.startsWith('M274 74')).toBe(true)
		})
	})

	it('stageSlot собирает слот этапа', () => {
		const box = { x: 1, y: 2, width: 3, height: 4 }
		expect(stageSlot(box, 5, [])).toEqual({ index: 5, box, topics: [] })
	})

	describe('buildRequirementLinks', () => {
		const geometry = geometryOf([
			[{ x: 0, y: 0 }],
			[
				{ x: 400, y: 0 },
				{ x: 420, y: 100 },
			],
			[{ x: 0, y: 200 }],
		])

		it('по горизонтали ведёт связь из бока в бок', () => {
			const paths = buildRequirementLinks(geometry, [{ from: { stage: 0, topic: null }, to: { stage: 1, topic: null } }], identity)
			expect(paths).toEqual(['M228 27 C314 27, 314 27, 400 27'])
		})

		it('по вертикали ведёт из низа в верх', () => {
			const paths = buildRequirementLinks(geometry, [{ from: { stage: 0, topic: null }, to: { stage: 2, topic: null } }], identity)
			expect(paths).toEqual(['M114 54 C114 127, 114 127, 114 200'])
		})

		it('вверх по вертикали ведёт из верха в низ', () => {
			const paths = buildRequirementLinks(geometry, [{ from: { stage: 2, topic: null }, to: { stage: 0, topic: null } }], identity)
			expect(paths).toEqual(['M114 200 C114 127, 114 127, 114 54'])
		})

		it('идёт справа налево по горизонтали', () => {
			const paths = buildRequirementLinks(geometry, [{ from: { stage: 1, topic: null }, to: { stage: 0, topic: null } }], identity)
			expect(paths).toEqual(['M400 27 C314 27, 314 27, 228 27'])
		})

		it('находит тему этапа и зеркалит путь', () => {
			const mirror = createMirror(500, true)
			const paths = buildRequirementLinks(geometry, [{ from: { stage: 1, topic: 0 }, to: { stage: 2, topic: null } }], mirror)
			expect(paths).toHaveLength(1)
			expect(paths[0].startsWith('M')).toBe(true)
			expect(paths[0]).not.toContain('NaN')
		})

		it('пропускает связи на несуществующие этапы и темы', () => {
			const paths = buildRequirementLinks(
				geometry,
				[
					{ from: { stage: 9, topic: null }, to: { stage: 0, topic: null } },
					{ from: { stage: 0, topic: null }, to: { stage: 9, topic: null } },
					{ from: { stage: 0, topic: 4 }, to: { stage: 1, topic: null } },
					{ from: { stage: 0, topic: null }, to: { stage: 1, topic: 0 } },
				],
				identity,
			)
			expect(paths).toHaveLength(1)
		})
	})
})

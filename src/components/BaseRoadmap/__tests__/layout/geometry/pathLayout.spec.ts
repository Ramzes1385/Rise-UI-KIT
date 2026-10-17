import { emptyGeometry } from '../../../model/layout/layoutShared'
import { mirroredPath, pathNumbers, stageInputs } from '../fixtures/geometryFixtures'
import { computePathLayout, ROADMAP_PATH_WIDTH } from '../../../model/layout/pathLayout'

const LTR = { isRtl: false }
const RTL = { isRtl: true }

describe('computePathLayout', () => {
	it('без этапов возвращает пустую геометрию той же ширины', () => {
		expect(computePathLayout([], LTR)).toEqual(emptyGeometry(816))
		expect(ROADMAP_PATH_WIDTH).toBe(816)
	})

	it.each([{ count: 1 }, { count: 2 }, { count: 6 }, { count: 24 }])('$count этапов: ширина 816, доли длиной этапы + 1', ({ count }) => {
		const geometry = computePathLayout(stageInputs({ count }), LTR)
		expect(geometry.width).toBe(816)
		expect(geometry.stages).toHaveLength(count)
		expect(geometry.fractions).toHaveLength(count + 1)
		expect(geometry.fractions[count]).toBe(1)
		expect(geometry.fractions[0]).toBeGreaterThan(0)
		geometry.fractions.slice(1).forEach((fraction, index) => expect(fraction).toBeGreaterThan(geometry.fractions[index]))
	})

	it('этапы чередуются на 50 px в обе стороны от центра, карточка 228 × 54', () => {
		const { stages } = computePathLayout(stageInputs({ count: 3 }), LTR)
		expect(stages.map(stage => stage.box.x)).toEqual([244, 344, 244])
		expect(stages[0].box).toMatchObject({ width: 228, height: 54 })
	})

	it('шаг между этапами без тем — 142, первый центр на y = 80', () => {
		const { stages, start, goal, height } = computePathLayout(stageInputs({ count: 3 }), LTR)
		expect(stages.map(stage => stage.box.y + 27)).toEqual([80, 222, 364])
		expect(start).toEqual({ x: 358, y: 24 })
		expect(goal).toEqual({ x: 358, y: 424 })
		expect(height).toBe(454)
	})

	it('шаг растёт, когда веер тем шире 142', () => {
		const { stages } = computePathLayout(stageInputs({ count: 2, topics: 7 }), LTR)
		expect(stages[1].box.y - stages[0].box.y).toBe(176)
		expect(stages[0].box.y + 27).toBe(93)
	})

	it('темы делятся пополам: первые ceil(n/2) — к началу строки, остальные — к концу', () => {
		const [stage] = computePathLayout(stageInputs({ count: 1, topics: 3 }), LTR).stages
		expect(stage.topics.map(topic => topic.side)).toEqual(['start', 'start', 'end'])
		const [first, second, third] = stage.topics
		expect(first.box.x + first.box.width).toBeLessThan(stage.box.x)
		expect(second.box.x + second.box.width).toBeLessThan(stage.box.x)
		expect(third.box.x).toBeGreaterThan(stage.box.x + stage.box.width)
	})

	it.each([
		{ topics: 1, sides: ['start'] },
		{ topics: 2, sides: ['start', 'end'] },
		{ topics: 3, sides: ['start', 'start', 'end'] },
		{ topics: 7, sides: ['start', 'start', 'start', 'start', 'end', 'end', 'end'] },
	])('$topics тем: стороны $sides, размер 200 × 34, ветка начинается с M', ({ topics, sides }) => {
		const [stage] = computePathLayout(stageInputs({ count: 1, topics }), LTR).stages
		expect(stage.topics.map(topic => topic.side)).toEqual(sides)
		stage.topics.forEach((topic, index) => {
			expect(topic.index).toBe(index)
			expect(topic.box).toMatchObject({ width: 200, height: 34 })
			expect(topic.branch.startsWith('M')).toBe(true)
		})
	})

	it('шаг между темами одной стороны — 44, у пары по одной на сторону — по центру этапа', () => {
		const seven = computePathLayout(stageInputs({ count: 1, topics: 7 }), LTR).stages[0]
		expect(seven.topics[1].box.y - seven.topics[0].box.y).toBe(44)
		expect(seven.topics[5].box.y - seven.topics[4].box.y).toBe(44)
		const two = computePathLayout(stageInputs({ count: 1, topics: 2 }), LTR).stages[0]
		expect(two.topics[0].box.y).toBe(two.topics[1].box.y)
	})

	it('две темы на стороне идут с шагом 48, три и больше — с шагом 44', () => {
		const pair = computePathLayout(stageInputs({ count: 1, topics: 3 }), LTR).stages[0]
		expect(pair.topics[1].box.y - pair.topics[0].box.y).toBe(48)
		const triple = computePathLayout(stageInputs({ count: 1, topics: 5 }), LTR).stages[0]
		expect(triple.topics[1].box.y - triple.topics[0].box.y).toBe(44)
	})

	it('цель опускается ниже последнего веера', () => {
		const flat = computePathLayout(stageInputs({ count: 1 }), LTR)
		const wide = computePathLayout(stageInputs({ count: 1, topics: 7 }), LTR)
		expect(flat.goal.y - (flat.stages[0].box.y + 27)).toBe(60)
		expect(wide.goal.y - (wide.stages[0].box.y + 27)).toBe(97)
	})

	it('24 этапа по 7 тем: геометрия конечна и высота растёт вместе с этапами', () => {
		const geometry = computePathLayout(stageInputs({ count: 24, topics: 7 }), LTR)
		expect(geometry.stages.flatMap(stage => stage.topics)).toHaveLength(168)
		expect(Number.isFinite(geometry.height)).toBe(true)
		expect(geometry.height).toBeGreaterThan(24 * 142)
		expect(pathNumbers(geometry.spine).every(Number.isFinite)).toBe(true)
	})

	it('isRtl зеркалит X в хребте и ветках, боксы остаются логическими', () => {
		const inputs = stageInputs({ count: 3, topics: 3 })
		const ltr = computePathLayout(inputs, LTR)
		const rtl = computePathLayout(inputs, RTL)
		expect(pathNumbers(rtl.spine)).toEqual(mirroredPath({ path: ltr.spine, width: 816 }))
		rtl.stages.forEach((stage, index) => {
			expect(stage.box).toEqual(ltr.stages[index].box)
			stage.topics.forEach((topic, topicIndex) => {
				const source = ltr.stages[index].topics[topicIndex]
				expect(topic.box).toEqual(source.box)
				expect(pathNumbers(topic.branch)).toEqual(mirroredPath({ path: source.branch, width: 816 }))
			})
		})
		expect(rtl.fractions).toEqual(ltr.fractions)
		expect(rtl.height).toBe(ltr.height)
	})

	it('не зависит от isExpanded: раскрытие этапа не двигает раскладку', () => {
		const collapsed = computePathLayout(stageInputs({ count: 4, topics: 5 }), LTR)
		const expanded = computePathLayout(stageInputs({ count: 4, topics: 5, isExpanded: true }), LTR)
		expect(expanded).toEqual(collapsed)
	})

	it('детерминирована: одни и те же входы дают равный результат', () => {
		const inputs = stageInputs({ count: 6, topics: 4 })
		expect(computePathLayout(inputs, LTR)).toEqual(computePathLayout(inputs, LTR))
	})

	it('этап без тем рядом с этапом с темами: высота шага считается по обоим', () => {
		const geometry = computePathLayout(
			[
				{ topics: 0, isExpanded: false },
				{ topics: 7, isExpanded: false },
			],
			LTR,
		)
		expect(geometry.stages[1].box.y - geometry.stages[0].box.y).toBe(142)
	})
})

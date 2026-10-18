import { emptyGeometry } from '../../../model/layout/layoutShared'
import { computeSnakeLayout } from '../../../model/layout/snakeLayout'
import { mirroredPath, pathNumbers, stageInputs } from '../fixtures/geometryFixtures'

const LTR = { isRtl: false }
const RTL = { isRtl: true }

function centerOf(box: { x: number; y: number; width: number; height: number }) {
	return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

describe('computeSnakeLayout', () => {
	it('без этапов возвращает пустую геометрию по ширине одной станции', () => {
		expect(computeSnakeLayout([], LTR)).toEqual(emptyGeometry(404))
	})

	it.each([
		{ count: 1, columns: 2, width: 680 },
		{ count: 2, columns: 3, width: 956 },
		{ count: 6, columns: 3, width: 956 },
		{ count: 24, columns: 3, width: 956 },
	])('$count этапов: $columns колонки, ширина $width', ({ count, width }) => {
		const geometry = computeSnakeLayout(stageInputs({ count }), LTR)
		expect(geometry.width).toBe(width)
		expect(geometry.stages).toHaveLength(count)
		expect(geometry.fractions).toHaveLength(count + 1)
		expect(geometry.fractions[count]).toBe(1)
	})

	it('в ряду три станции, ряды идут в обе стороны, цель — последняя станция (седьмая)', () => {
		const geometry = computeSnakeLayout(stageInputs({ count: 6 }), LTR)
		const centers = geometry.stages.map(stage => centerOf(stage.box))
		expect(centers.map(center => center.x)).toEqual([202, 478, 754, 754, 478, 202])
		expect(centers.map(center => center.y)).toEqual([60, 60, 60, 210, 210, 210])
		expect(geometry.goal).toEqual({ x: 202, y: 360 })
		expect(geometry.start).toEqual({ x: 64, y: 60 })
	})

	it('в неполном ряду ровно столько станций, сколько есть', () => {
		const geometry = computeSnakeLayout(stageInputs({ count: 4 }), LTR)
		const centers = geometry.stages.map(stage => centerOf(stage.box))
		expect(centers.map(center => center.x)).toEqual([202, 478, 754, 754])
		expect(geometry.goal).toEqual({ x: 478, y: 210 })
	})

	it('24 этапа: 25 станций в 9 рядах, последняя станция одна в ряду', () => {
		const geometry = computeSnakeLayout(stageInputs({ count: 24 }), LTR)
		expect(geometry.goal).toEqual({ x: 202, y: 60 + 8 * 150 })
		expect(geometry.height).toBe(60 + 8 * 150 + 90)
	})

	it('поворот между рядами — кубическая кривая с вылетом 60', () => {
		const { spine } = computeSnakeLayout(stageInputs({ count: 6 }), LTR)
		expect(spine).toContain('L892 60 C952 60, 952 210, 892 210')
		expect(spine).toContain('L64 210 C4 210, 4 360, 64 360')
	})

	it('хребет начинается в отступе слева и проходит через все станции', () => {
		const { spine } = computeSnakeLayout(stageInputs({ count: 2 }), LTR)
		expect(spine).toBe('M64 60 L202 60 L478 60 L754 60')
	})

	it('шаг рядов 150, а раскрытый этап раздвигает ряд на стек тем: n·40 − 6 + 94', () => {
		const collapsed = computeSnakeLayout(stageInputs({ count: 6, topics: 7 }), LTR)
		expect(collapsed.stages[3].box.y + 27).toBe(210)
		const inputs = stageInputs({ count: 6, topics: 7 })
		inputs[1] = { topics: 7, isExpanded: true }
		const expanded = computeSnakeLayout(inputs, LTR)
		expect(expanded.stages[3].box.y + 27).toBe(60 + 7 * 40 - 6 + 94)
		expect(expanded.height).toBeGreaterThan(collapsed.height)
	})

	it('раскрытый этап с одной темой не сжимает ряд меньше 150', () => {
		const inputs = stageInputs({ count: 6, topics: 1 })
		inputs[0] = { topics: 1, isExpanded: true }
		expect(computeSnakeLayout(inputs, LTR).stages[3].box.y + 27).toBe(210)
	})

	it('высота учитывает раскрытый этап в последнем ряду', () => {
		const flat = computeSnakeLayout(stageInputs({ count: 2 }), LTR)
		const inputs = stageInputs({ count: 2, topics: 7 })
		inputs[1] = { topics: 7, isExpanded: true }
		const open = computeSnakeLayout(inputs, LTR)
		expect(flat.height).toBe(150)
		expect(open.height).toBe(60 + 27 + 16 + 274 + 24)
	})

	it('темы идут столбцом под карточкой этапа', () => {
		const inputs = stageInputs({ count: 2, topics: 3, isExpanded: true })
		const [stage] = computeSnakeLayout(inputs, LTR).stages
		expect(stage.topics.map(topic => topic.side)).toEqual(['below', 'below', 'below'])
		expect(stage.topics.map(topic => topic.box.y - stage.box.y)).toEqual([70, 110, 150])
		expect(stage.topics[0].box.x).toBe(stage.box.x + 32)
	})

	it('isRtl зеркалит хребет и ветки, боксы остаются логическими', () => {
		const inputs = stageInputs({ count: 6, topics: 2, isExpanded: true })
		const ltr = computeSnakeLayout(inputs, LTR)
		const rtl = computeSnakeLayout(inputs, RTL)
		expect(pathNumbers(rtl.spine)).toEqual(mirroredPath({ path: ltr.spine, width: 956 }))
		expect(pathNumbers(rtl.stages[0].topics[0].branch)).toEqual(mirroredPath({ path: ltr.stages[0].topics[0].branch, width: 956 }))
		expect(rtl.stages.map(stage => stage.box)).toEqual(ltr.stages.map(stage => stage.box))
		expect(rtl.fractions).toEqual(ltr.fractions)
	})

	it('7 тем в каждом этапе и детерминированность', () => {
		const inputs = stageInputs({ count: 24, topics: 7, isExpanded: true })
		const first = computeSnakeLayout(inputs, LTR)
		expect(first.stages.flatMap(stage => stage.topics)).toHaveLength(168)
		expect(pathNumbers(first.spine).every(Number.isFinite)).toBe(true)
		expect(computeSnakeLayout(inputs, LTR)).toEqual(first)
	})
})

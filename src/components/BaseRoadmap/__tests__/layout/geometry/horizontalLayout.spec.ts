import { emptyGeometry } from '../../../model/layout/layoutShared'
import { computeHorizontalLayout } from '../../../model/layout/horizontalLayout'
import { mirroredPath, pathNumbers, stageInputs } from '../fixtures/geometryFixtures'

const LTR = { isRtl: false }
const RTL = { isRtl: true }

describe('computeHorizontalLayout', () => {
	it('без этапов возвращает пустую геометрию по ширине одной станции', () => {
		expect(computeHorizontalLayout([], LTR)).toEqual(emptyGeometry(404))
	})

	it.each([
		{ count: 1, width: 680 },
		{ count: 2, width: 956 },
		{ count: 6, width: 2060 },
		{ count: 24, width: 7028 },
	])('$count этапов: ширина $width, станции по 276 слева направо', ({ count, width }) => {
		const geometry = computeHorizontalLayout(stageInputs({ count }), LTR)
		expect(geometry.width).toBe(width)
		expect(geometry.stages.map(stage => stage.box.x + 114)).toEqual(
			Array.from({ length: count }, (_, index) => 64 + 276 * (index + 0.5)),
		)
		expect(geometry.goal).toEqual({ x: 64 + 276 * (count + 0.5), y: 60 })
		expect(geometry.fractions).toHaveLength(count + 1)
		expect(geometry.fractions[count]).toBe(1)
	})

	it('одна дорога на y = 60, начало в отступе', () => {
		const geometry = computeHorizontalLayout(stageInputs({ count: 2 }), LTR)
		expect(geometry.start).toEqual({ x: 64, y: 60 })
		expect(geometry.stages.every(stage => stage.box.y + 27 === 60)).toBe(true)
		expect(geometry.spine).toBe('M64 60 L202 60 L478 60 L754 60')
	})

	it('доли длины растут по станциям', () => {
		const { fractions } = computeHorizontalLayout(stageInputs({ count: 2 }), LTR)
		expect(fractions).toEqual([0.2, 0.6, 1])
	})

	it('темы идут столбцом под этапом, высота растёт с самым большим раскрытым стеком', () => {
		const flat = computeHorizontalLayout(stageInputs({ count: 3, topics: 7 }), LTR)
		expect(flat.height).toBe(60 + 27 + 32)
		const inputs = stageInputs({ count: 3, topics: 2 })
		inputs[0] = { topics: 2, isExpanded: true }
		inputs[2] = { topics: 7, isExpanded: true }
		const open = computeHorizontalLayout(inputs, LTR)
		expect(open.height).toBe(60 + 27 + 16 + 274 + 32)
		expect(open.stages[0].topics.map(topic => topic.side)).toEqual(['below', 'below'])
		expect(open.stages[2].topics).toHaveLength(7)
	})

	it('isRtl зеркалит хребет и ветки, боксы остаются логическими', () => {
		const inputs = stageInputs({ count: 3, topics: 2, isExpanded: true })
		const ltr = computeHorizontalLayout(inputs, LTR)
		const rtl = computeHorizontalLayout(inputs, RTL)
		expect(pathNumbers(rtl.spine)).toEqual(mirroredPath({ path: ltr.spine, width: ltr.width }))
		expect(pathNumbers(rtl.stages[1].topics[1].branch)).toEqual(
			mirroredPath({ path: ltr.stages[1].topics[1].branch, width: ltr.width }),
		)
		expect(rtl.stages.map(stage => stage.box)).toEqual(ltr.stages.map(stage => stage.box))
	})

	it('24 этапа по 7 тем: конечна и детерминирована', () => {
		const inputs = stageInputs({ count: 24, topics: 7, isExpanded: true })
		const first = computeHorizontalLayout(inputs, LTR)
		expect(pathNumbers(first.spine).every(Number.isFinite)).toBe(true)
		expect(computeHorizontalLayout(inputs, LTR)).toEqual(first)
	})
})

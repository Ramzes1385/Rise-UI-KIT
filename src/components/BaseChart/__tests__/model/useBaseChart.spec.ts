import { render } from '@testing-library/vue'
import { computed, defineComponent, ref } from 'vue'
import { useBaseChart } from '../../model/useBaseChart'
import { useChartActive } from '../../model/useChartActive'
import type { BaseChartProps } from '../../types/BaseChart.types'
import { useChartAxes, useChartData } from '../../model/useChartData'

const empty: BaseChartProps = { label: 'Пусто', labels: [], series: [{ name: 'Ряд', values: [] }] }

describe('модель графика без значений по умолчанию', () => {
	it('без height берёт 240px, без yTickCount — 5 делений', () => {
		let chart: ReturnType<typeof useBaseChart> | undefined
		render(
			defineComponent({
				setup() {
					chart = useBaseChart({ label: 'Ряд', labels: ['a', 'b'], series: [{ name: 'Ряд', values: [0, 10] }] }, () => undefined)
					return () => null
				},
			}),
		)
		expect(chart?.plotHeight.value).toBe('240px')
		expect(chart?.yTicks.value).toHaveLength(6)
		expect(chart?.shapesClass.value).toBe('base-chart__shapes--grow')
		expect(chart?.isSwapAnimated.value).toBe(true)
	})

	it('на пустых данных не рисует деления Y и игнорирует указатель и клавиши', () => {
		const data = useChartData(empty, ref([]))
		const view = { spans: data.spans, slots: data.slots, frame: data.frame }
		const layout = { view, width: ref(0), height: computed(() => 240), maxXTicks: ref(6) }
		const axes = useChartAxes(empty, data, layout)
		const active = useChartActive(empty, data, layout)
		expect(data.isEmpty.value).toBe(true)
		expect(axes.yTicks.value).toEqual([])
		const event = { key: 'ArrowRight', preventDefault: vi.fn() } as unknown as KeyboardEvent
		active.handleKeydown(event)
		active.handlePointerMove({ clientX: 10, currentTarget: { getBoundingClientRect: () => ({ left: 0, width: 100 }) } } as never)
		expect(active.activeIndex.value).toBeNull()
		expect(event.preventDefault).not.toHaveBeenCalled()
		expect(active.guide.value).toBeNull()
		expect(active.guideOffset.value).toBe(0)
	})

	it('подпись вне массива подписей — пустая строка', () => {
		const data = useChartData(empty, ref([]))
		expect(data.formatLabel(undefined)).toBe('')
		const custom = useChartData({ ...empty, formatLabel: label => `[${String(label)}]` }, ref([]))
		expect(custom.formatLabel(undefined)).toBe('')
	})
})

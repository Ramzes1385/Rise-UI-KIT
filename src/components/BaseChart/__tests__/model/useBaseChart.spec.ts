import { defineComponent, ref } from 'vue'
import { render } from '@testing-library/vue'
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
	})

	it('на пустых данных не рисует деления Y и игнорирует указатель и клавиши', () => {
		const data = useChartData(empty, ref([]))
		const axes = useChartAxes(empty, data, ref(6))
		const active = useChartActive(empty, data)
		expect(data.isEmpty.value).toBe(true)
		expect(axes.yTicks.value).toEqual([])
		const event = { key: 'ArrowRight', preventDefault: vi.fn() } as unknown as KeyboardEvent
		active.handleKeydown(event)
		active.handlePointerMove({ clientX: 10, currentTarget: { getBoundingClientRect: () => ({ left: 0, width: 100 }) } } as never)
		expect(active.activeIndex.value).toBeNull()
		expect(event.preventDefault).not.toHaveBeenCalled()
		expect(active.guide.value).toBeNull()
	})

	it('подпись вне массива подписей — пустая строка', () => {
		const data = useChartData(empty, ref([]))
		expect(data.formatLabel(undefined)).toBe('')
		const custom = useChartData({ ...empty, formatLabel: label => `[${String(label)}]` }, ref([]))
		expect(custom.formatLabel(undefined)).toBe('')
	})
})

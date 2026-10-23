import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import BaseHeatmap from '../ui/BaseHeatmap.vue'

const PROPS = { label: 'Коммиты', endDate: '2025-05-15', weeks: 2 }

describe('BaseHeatmap: движение данных', () => {
	it('новые данные перекрашивают те же ячейки: узлы сохраняются, меняется только уровень', async () => {
		const { container, rerender } = render(BaseHeatmap, {
			props: {
				...PROPS,
				data: [
					{ date: '2025-05-15', value: 4 },
					{ date: '2025-05-14', value: 1 },
				],
			},
		})
		const before = [...container.querySelectorAll('.base-heatmap__cell')]
		const last = before[before.length - 1]
		expect(last).toHaveClass('base-heatmap__cell--4')

		await rerender({
			data: [
				{ date: '2025-05-15', value: 1 },
				{ date: '2025-05-14', value: 4 },
			],
		})
		const after = [...container.querySelectorAll('.base-heatmap__cell')]

		expect(after).toHaveLength(before.length)
		expect(after.every((cell, index) => cell === before[index])).toBe(true)
		expect(last).toHaveClass('base-heatmap__cell--1')
		expect(last).not.toHaveClass('base-heatmap__cell--4')
		expect(after[after.length - 2]).toHaveClass('base-heatmap__cell--4')
	})

	it('без markColor цвет не задаётся на корне: его берут токен и цвет графиков', () => {
		const { container } = render(BaseHeatmap, { props: { ...PROPS, data: [] } })

		expect((container.querySelector('.base-heatmap') as HTMLElement).style.getPropertyValue('--heatmap-color')).toBe('')
	})
})

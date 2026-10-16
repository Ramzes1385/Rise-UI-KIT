import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { setLocale } from '@/locales/state'
import BaseHeatmap from '../ui/BaseHeatmap.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const DATA = [
	{ date: '2025-05-15', value: 4 },
	{ date: '2025-05-14', value: 1 },
	{ date: new Date(2025, 4, 14), value: 1 },
	{ date: '2025-05-01', value: 8 },
]

describe('BaseHeatmap', () => {
	afterEach(() => {
		setLocale('ru')
		vi.restoreAllMocks()
	})

	it('календарь шире области прокручивается с клавиатуры: tabindex только при прокрутке', async () => {
		vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(720)
		vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(320)
		const wide = render(BaseHeatmap, { props: { data: DATA, label: 'Коммиты', endDate: '2025-05-15' } })
		await nextTick()
		expect(wide.getByRole('img')).toHaveAttribute('tabindex', '0')
		wide.unmount()

		vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(320)
		const narrow = render(BaseHeatmap, { props: { data: DATA, label: 'Коммиты', endDate: '2025-05-15', weeks: 4 } })
		await nextTick()
		expect(narrow.getByRole('img')).not.toHaveAttribute('tabindex')
	})

	it('недели столбцами с понедельника, уровни от максимума, сводка для скринридера', () => {
		const { container } = render(BaseHeatmap, { props: { data: DATA, label: 'Коммиты', endDate: '2025-05-15', weeks: 4 } })
		const cells = container.querySelectorAll('.base-heatmap__cell')

		expect(cells).toHaveLength(25)
		expect(screen.getByRole('img', { name: 'Коммиты: всего 14, больше всего 8 — 1 мая 2025 г.' })).toBeInTheDocument()
		expect(container.querySelector('.base-heatmap__cell--4')).toHaveAttribute('x', `${28 + 1 * 13}`)
		expect(cells[cells.length - 1]).toHaveClass('base-heatmap__cell--2')
		expect(cells[cells.length - 2]).toHaveClass('base-heatmap__cell--1')
		expect(container.querySelectorAll('.base-heatmap__caption')[0]).toHaveTextContent('май')
		expect(container.querySelector('.base-heatmap__scale')).toHaveTextContent('Меньше Больше')
	})

	it('наведение показывает значение и дату; свой цвет, вариант и формат', async () => {
		const { container } = render(BaseHeatmap, {
			props: {
				data: DATA,
				label: 'Коммиты',
				endDate: new Date(2025, 4, 15),
				weeks: 2,
				markColor: 'rgb(1, 2, 3)',
				variant: 'square',
				formatValue: (value: number) => `${value} комм.`,
			},
		})
		const cells = container.querySelectorAll('.base-heatmap__cell')

		await fireEvent.pointerEnter(cells[cells.length - 1])
		expect(container.querySelector('.base-heatmap__tooltip')).toHaveTextContent('4 комм. · 15 мая 2025 г.')
		expect(cells[cells.length - 1]).toHaveClass('base-heatmap__cell--active')
		await fireEvent.pointerLeave(cells[cells.length - 1])
		expect(container.querySelector('.base-heatmap__tooltip')).toHaveTextContent('')
		expect(container.querySelector('.base-heatmap')).toHaveClass('base-heatmap--square')
		expect((container.querySelector('.base-heatmap') as HTMLElement).style.getPropertyValue('--heatmap-color')).toBe('rgb(1, 2, 3)')
	})

	it('без данных и по умолчанию до сегодняшнего дня; язык', () => {
		setLocale('en')
		const { container } = render(BaseHeatmap, { props: { data: [], label: 'Commits' } })

		expect(container.querySelectorAll('.base-heatmap__cell').length).toBeGreaterThan(360)
		expect(container.querySelector('rect.base-heatmap__cell--1')).toBeNull()
		expect(screen.getByRole('img')).toHaveAccessibleName(/^Commits: 0 in total, peak 0 on/)
	})

	it('первый день недели и названия дней — из языка кита: по-русски с понедельника, по-английски с воскресенья', () => {
		const labels = (): (string | null)[] =>
			Array.from(document.querySelectorAll('.base-heatmap__caption')).map(node => node.textContent)
		const ru = render(BaseHeatmap, { props: { data: DATA, label: 'Коммиты', endDate: '2025-05-18', weeks: 3 } })
		expect(labels()).toEqual(expect.arrayContaining(['пн', 'ср', 'пт']))
		expect(ru.container.querySelector('.base-heatmap__cell')).toHaveAttribute('y', '18')
		ru.unmount()

		setLocale('en')
		const en = render(BaseHeatmap, { props: { data: DATA, label: 'Commits', endDate: '2025-05-18', weeks: 3 } })
		expect(labels()).toEqual(expect.arrayContaining(['Sun', 'Tue', 'Thu']))
		expect(en.container.querySelector('.base-heatmap__cell')).toHaveAttribute('y', '18')
	})
})

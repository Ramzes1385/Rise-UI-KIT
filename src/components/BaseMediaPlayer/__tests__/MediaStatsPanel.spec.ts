import '@testing-library/jest-dom/vitest'
import MediaStatsPanel from '../ui/MediaStatsPanel.vue'
import { fireEvent, render, screen, within } from '@testing-library/vue'

const EVENTS = [
	{ id: 2, clock: '10:00:01.250', position: '0:01.2', type: 'waiting', detail: '' },
	{ id: 1, clock: '10:00:00.000', position: '0:00.0', type: 'loadstart', detail: 'https://cdn.example.com/demo.webm' },
]

describe('MediaStatsPanel', () => {
	it('показатели, вкладка событий со счётчиком, копирование отчёта и закрытие', async () => {
		const { emitted } = render(MediaStatsPanel, { props: { rows: [{ label: 'Формат', value: 'video/webm' }], events: EVENTS } })
		const panel = screen.getByRole('region', { name: 'Данные для отладки' })

		expect(panel).toHaveTextContent('Форматvideo/webm')
		expect(screen.getByRole('button', { name: 'Показатели' })).toHaveAttribute('aria-pressed', 'true')
		await fireEvent.click(screen.getByRole('button', { name: 'События 2' }))
		expect(screen.getByRole('button', { name: 'События 2' })).toHaveAttribute('aria-pressed', 'true')
		const items = within(screen.getByRole('list', { name: 'События' })).getAllByRole('listitem')
		expect(items.map(item => item.textContent)).toEqual([
			'10:00:01.2500:01.2waiting',
			'10:00:00.0000:00.0loadstarthttps://cdn.example.com/demo.webm',
		])
		await fireEvent.click(screen.getByRole('button', { name: 'Скопировать отчёт' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
		expect(Object.keys(emitted())).toEqual(expect.arrayContaining(['copy', 'close']))
	})

	it('пустой лог — подсказка', async () => {
		render(MediaStatsPanel, { props: { rows: [], events: [] } })

		await fireEvent.click(screen.getByRole('button', { name: 'События 0' }))
		expect(screen.getByRole('list', { name: 'События' })).toHaveTextContent('Событий пока нет')
	})
})

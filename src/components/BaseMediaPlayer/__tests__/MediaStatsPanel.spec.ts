import '@testing-library/jest-dom/vitest'
import MediaStatsPanel from '../ui/MediaStatsPanel.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('MediaStatsPanel', () => {
	it('строки показателей, копирование и закрытие', async () => {
		const { emitted } = render(MediaStatsPanel, { props: { rows: [{ label: 'Формат', value: 'video/webm' }] } })

		expect(screen.getByRole('region', { name: 'Техническая информация' })).toHaveTextContent('Форматvideo/webm')
		await fireEvent.click(screen.getByRole('button', { name: 'Скопировать сведения' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
		expect(Object.keys(emitted())).toEqual(expect.arrayContaining(['copy', 'close']))
	})
})

import type meta from '../../BaseChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { CHANNEL_SERIES, QUARTERS } from '../../shared'

export const Bars: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Столбики (`variant="bar"`): ряды стоят группой в полосе каждой подписи.' } },
	},
	args: { variant: 'bar', label: 'Заказы по каналам за 2026 год', labels: QUARTERS, series: CHANNEL_SERIES, labelsTitle: 'Квартал' },
}

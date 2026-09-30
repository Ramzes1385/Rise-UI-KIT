import type meta from '../../BaseMap.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { installDemoYandex } from '../../demoProvider'

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Пока скрипт поставщика загружается, поверх карты — индикатор «Загрузка карты...», у области `aria-busy`. Здесь демо-поставщик не отвечает никогда.',
			},
		},
	},
	args: { apiKey: 'demo' },
	beforeEach: () => installDemoYandex({ isPending: true }),
	play: async ({ canvas }) => {
		const map = canvas.getByRole('region', { name: 'Карта' })
		await waitFor(() => expect(map).toHaveAttribute('aria-busy', 'true'))
		await expect(canvas.getByRole('status')).toHaveAccessibleName(/Загрузка карты/)
	},
}

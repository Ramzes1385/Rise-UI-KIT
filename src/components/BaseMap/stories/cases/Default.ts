import { expect } from 'storybook/test'
import type meta from '../BaseMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Без ключа внешний скрипт не загружается — вместо карты заглушка. Вставьте свой ключ Яндекс Карт в `apiKey` в Controls, и карта загрузится (ключ никуда не сохраняется).',
			},
		},
	},
	play: async ({ canvas }) => {
		const map = canvas.getByRole('region', { name: 'Карта' })
		await expect(map).toHaveTextContent('Нужен ключ API')
		await expect(document.querySelector('script[src*="api-maps.yandex.ru"]')).toBeNull()
	},
}

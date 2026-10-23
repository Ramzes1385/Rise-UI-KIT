import type meta from '../BaseMap.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { STORY_YANDEX_MAPS_KEY, withYandexMapsKey } from '@/stories/helpers'

const SCRIPT = 'script[src*="api-maps.yandex.ru"]'

export const Default: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'Без ключа внешний скрипт не загружается — вместо карты заглушка. Выберите поставщика и вставьте свой ключ в `apiKey` в Controls, и карта загрузится (ключ никуда не сохраняется).',
					'Ключ Яндекс Карт можно положить в `.env.local`: `STORYBOOK_YANDEX_MAPS_API_KEY=…` (шаблон — `.env.example`) — эта история подхватит его на dev-сервере (`npm run storybook`), на холсте и в рамке здесь; в статическую сборку и в автоматические прогоны ключ не попадает.',
				].join('\n'),
			},
			story: { inline: false, height: '400px' },
		},
	},
	play: async ({ canvas }) => {
		const map = canvas.getByRole('region', { name: 'Карта' })
		if (STORY_YANDEX_MAPS_KEY) {
			await waitFor(() => expect(document.querySelector(SCRIPT)).not.toBeNull())
			await expect(map).not.toHaveTextContent('Нужен ключ API')
			return
		}
		await expect(map).toHaveTextContent('Нужен ключ API')
		await expect(canvas.getByText(/положите его в \.env\.local/i)).toBeVisible()
		await expect(document.querySelector(SCRIPT)).toBeNull()
	},
}

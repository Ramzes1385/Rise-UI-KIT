import type meta from '../../BaseMap.stories'
import { placeholderImage } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import { installDemoYandex } from '../../demoProvider'
import { expect, waitFor, within } from 'storybook/test'

const preview = placeholderImage({ width: 800, height: 400, hue: 200 })

export const StaticPreview: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`staticPreview` — адрес статичной картинки (например, Static API поставщика), которая видна, пока интерактивная карта грузится, и до монтирования при SSR:',
					'пустой экран не мигает, раскладка не прыгает. Картинка декоративна (`alt=""`): карту описывает `ariaLabel` области. Когда карта готова, картинка уходит.',
					'Без ключа и при ошибке загрузки вместо картинки показывается заглушка. Здесь демо-поставщик не отвечает никогда, поэтому состояние «грузится» остаётся навсегда.',
				].join('\n'),
			},
			story: { inline: false, height: '400px' },
		},
		controls: { include: ['variant', 'sizeScale', 'height'] },
	},
	args: { apiKey: 'demo', staticPreview: preview, ariaLabel: 'Карта офиса' },
	beforeEach: () => installDemoYandex({ isPending: true }),
	play: async ({ canvas, canvasElement }) => {
		const map = canvas.getByRole('region', { name: 'Карта офиса' })
		await waitFor(() => expect(map).toHaveAttribute('aria-busy', 'true'))
		const image = canvasElement.querySelector('img.base-map__preview') as HTMLImageElement
		await expect(image).toBeVisible()
		await expect(image).toHaveAttribute('alt', '')
		await expect(image.src).toBe(preview)
		await expect(within(map).getByRole('status')).toHaveAccessibleName(/Загрузка карты/)
		await expect(within(map).queryByText('Нужен ключ API')).toBeNull()
	},
}

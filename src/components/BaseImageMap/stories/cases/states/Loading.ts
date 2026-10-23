import { expect } from 'storybook/test'
import { imageMapByUrl } from '../../fixtures'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

const PLAN_URL = '/plans/floor-1.svg'

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'SVG слоя по адресу (`svgUrl`) ещё грузится: в окне карты — статус «Загрузка карты…» (`role="status"`).',
			},
		},
	},
	args: { data: imageMapByUrl(PLAN_URL) },
	beforeEach: () => {
		const original = window.fetch
		window.fetch = (input, init) => (String(input) === PLAN_URL ? new Promise<Response>(() => undefined) : original(input, init))
		return () => {
			window.fetch = original
		}
	},
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('status')).toHaveTextContent('Загрузка карты…')
	},
}

import { docsFrame } from '@/stories/helpers'
import type meta from '../BaseRoadmap.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(820),
			description: {
				story: [
					'Песочница: путь «Frontend-разработчик на Vue» — шесть этапов, 26 тем, 14 изучено. Этап «Vue 3» раскрыт, тема «Pinia» выбрана,',
					'справа её панель. `v-model` для `progress`, `expanded`, `selected` и `filter` связаны с Controls: клик по теме меняет',
					'выбранную тему, галочка в круге слева от названия — отмечает тему изученной.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('region', { name: 'Frontend-разработчик на Vue' })).toBeVisible()
		await expect(await canvas.findByText('14 из 26 тем')).toBeVisible()
		const pinia = await canvas.findByRole('button', { name: /^Pinia/ })
		await expect(pinia).toHaveAttribute('aria-pressed', 'true')

		await userEvent.click(await canvas.findByRole('button', { name: /^Vue Router/ }))
		await waitFor(() => expect(canvas.getByRole('button', { name: /^Vue Router/ })).toHaveAttribute('aria-pressed', 'true'))
		await expect(canvas.getByRole('heading', { level: 2, name: 'Vue Router' })).toBeVisible()
		await expect(pinia).toHaveAttribute('aria-pressed', 'false')
	},
}

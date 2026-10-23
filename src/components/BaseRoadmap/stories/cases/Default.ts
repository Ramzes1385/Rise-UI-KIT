import type meta from '../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { docsFrame, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(820),
			description: {
				story: [
					'Песочница: путь «Frontend-разработчик на Vue» — шесть этапов, 26 тем, 14 изучено. Этап «Vue 3» раскрыт: нажмите тему,',
					'и справа откроется её панель (в узком контейнере — нижняя шторка). `v-model` для `progress`, `expanded`, `selected`',
					'и `filter` связаны с Controls: клик по теме меняет выбранную тему, кружок слева от названия отмечает тему изученной.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvas.getByRole('region', { name: 'Frontend-разработчик на Vue' })).toBeVisible()
		await expect(await canvas.findByText(/14 из 26 тем/)).toBeVisible()

		const pinia = await canvas.findByRole('button', { name: /^Pinia/ })
		await userEvent.click(pinia)
		await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: 'Pinia' })).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
		await expect(canvasElement.querySelector('[data-topic-id="pinia"] .base-roadmap__topic-button')).toHaveAttribute(
			'aria-pressed',
			'true',
		)
		await waitFor(() => expect(screen.getByText('1 из 3 подтем')).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
	},
}

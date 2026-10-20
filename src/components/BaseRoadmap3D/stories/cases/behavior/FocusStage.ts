import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { docsFrame, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const FocusStage: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(700),
			description: {
				story: [
					'Этап в фокусе (`focused: "s4"`): камера наехала на пьедестал «Vue 3», справа открыта панель этапа — кольцо прогресса, темы',
					'и «или» между равноценными (Vue Router и Nuxt). Тема открывается в той же панели, «К этапу» возвращает к этапу,',
					'«Закрыть панель» возвращает обзор острова (в Default).',
				].join('\n'),
			},
		},
	},
	args: { focused: 's4' },
	play: async ({ canvas, userEvent }) => {
		const panel = await canvas.findByRole('region', { name: 'Подробности темы' })
		await expect(within(panel).getByRole('heading', { level: 2, name: 'Vue 3' })).toBeVisible()
		await expect(within(panel).getAllByText('или').length).toBeGreaterThan(0)

		await userEvent.click(within(panel).getByRole('button', { name: /^Pinia/ }))
		await waitFor(() => expect(within(panel).getByRole('heading', { level: 2, name: 'Pinia' })).toBeVisible(), {
			timeout: STORY_WAIT_TIMEOUT,
		})
		await userEvent.click(within(panel).getByRole('button', { name: 'К этапу' }))
		await expect(await within(panel).findByRole('heading', { level: 2, name: 'Vue 3' })).toBeVisible()
	},
}

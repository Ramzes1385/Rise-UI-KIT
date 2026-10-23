import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { docsFrame, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const Tour: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			...docsFrame(700),
			description: {
				story: [
					'Тур по этапам: кнопка «Запустить тур» в шапке (`hasTour`) ведёт камеру по этапам, каждые 2,6 с — следующий; внизу вместо полосы',
					'этапов — «Предыдущий / Остановить / Следующий». Любой ввод — клик по острову, клавиша — останавливает тур.',
					'`v-model:isTourPlaying` отдаёт состояние наружу, при «уменьшить движение» камера переходит сразу, без полёта.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(await canvas.findByRole('button', { name: 'Запустить тур' }))
		const tour = await canvas.findByRole('group', { name: 'Тур по этапам' })
		await expect(within(tour).getByText(/^Этап \d из 6$/)).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Остановить тур', pressed: true })).toBeVisible()

		await userEvent.click(within(tour).getByRole('button', { name: 'Следующий этап' }))
		await expect(within(tour).getByText(/^Этап \d из 6$/)).toBeVisible()
		await userEvent.click(within(tour).getByRole('button', { name: 'Остановить тур' }))
		await waitFor(() => expect(canvas.queryByRole('group', { name: 'Тур по этапам' })).toBeNull(), { timeout: STORY_WAIT_TIMEOUT })
		await expect(canvas.getByRole('button', { name: 'Запустить тур' })).toBeVisible()
	},
}

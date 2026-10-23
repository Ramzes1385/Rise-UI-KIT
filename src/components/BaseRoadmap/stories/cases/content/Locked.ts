import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { miniRoadmap, noProgress } from '../../demo/mini'
import { docsFrame, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const Locked: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(760),
			description: {
				story: [
					'Закрытые темы и этапы. `requires` темы («Нужно знать») закрывает её, пока требования не пройдены: статус «Закрыта», замок,',
					'в тексте для скринридера — «нужно знать Шаблоны», подтемы и «Отметить изученной» недоступны. `requires` этапа закрывает',
					'весь этап: «Откроется после «Основы»». Требования в панели — кнопки, они ведут к нужной теме.',
				].join('\n'),
			},
		},
	},
	args: {
		data: miniRoadmap,
		progress: noProgress,
		layout: 'list',
		expanded: ['basics'],
		selected: null,
	},
	play: async ({ canvas, userEvent }) => {
		const reactivity = await canvas.findByRole('button', { name: /^Реактивность/ })
		await expect(reactivity).toHaveAccessibleName(/закрыта: нужно знать Шаблоны/)
		const app = canvas.getByRole('button', { name: /Приложение/ })
		await expect(app).toHaveAttribute('aria-disabled', 'true')
		await expect(canvas.getByText('Откроется после «Основы»')).toBeVisible()

		await userEvent.click(reactivity)
		await expect(await screen.findByRole('checkbox', { name: 'ref и reactive' })).toBeDisabled()
		await expect(screen.getByRole('button', { name: 'Отметить изученной' })).toBeDisabled()

		const findRequirement = (): HTMLElement | undefined =>
			screen.getAllByRole('button', { name: /^Шаблоны/ }).find(button => button.closest('.base-roadmap__requirements'))
		await waitFor(() => expect(findRequirement()).toBeTruthy())
		await userEvent.click(findRequirement() as HTMLElement)
		await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: 'Шаблоны' })).toBeVisible(), {
			timeout: STORY_WAIT_TIMEOUT,
		})
		await userEvent.click(await screen.findByRole('button', { name: 'Отметить изученной' }))
		await waitFor(() => expect(screen.getByRole('button', { name: 'Вернуть в работу' })).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('button', { name: 'Вернуть в работу' })).toBeNull())
		await waitFor(() => expect(canvas.getByRole('button', { name: /^Реактивность/ })).not.toHaveAccessibleName(/закрыта/))
	},
}

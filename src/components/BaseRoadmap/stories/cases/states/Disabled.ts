import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { docsFrame, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(820),
			description: {
				story: [
					'Отключённый роадмап (`isDisabled`): путь можно смотреть — раскрывать этапы, выбирать темы, читать панель, — но нельзя',
					'менять прогресс: подтемы, «Отметить изученной» и кружок темы не работают, методы ref и хранилище ничего не меняют.',
				].join('\n'),
			},
		},
	},
	args: { isDisabled: true, selected: null },
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('region', { name: 'Frontend-разработчик на Vue' })).toHaveAttribute('aria-disabled', 'true')
		await userEvent.click(await canvas.findByRole('button', { name: /^Vue Router/ }))
		await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: 'Vue Router' })).toBeVisible(), {
			timeout: STORY_WAIT_TIMEOUT,
		})
		await expect(await screen.findByRole('checkbox', { name: 'Навигационные хуки' })).toBeDisabled()
		await expect(screen.getByRole('button', { name: 'Отметить изученной' })).toBeDisabled()
		await expect(args['onStatus-change']).not.toHaveBeenCalled()
	},
}

import { expect } from 'storybook/test'
import { docsFrame } from '@/stories/helpers'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

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
	args: { isDisabled: true },
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('region', { name: 'Frontend-разработчик на Vue' })).toHaveAttribute('aria-disabled', 'true')
		await expect(await canvas.findByRole('checkbox', { name: 'Геттеры и действия' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Отметить изученной' })).toBeDisabled()

		await userEvent.click(await canvas.findByRole('button', { name: /^Vue Router/ }))
		await expect(await canvas.findByRole('heading', { level: 2, name: 'Vue Router' })).toBeVisible()
		await expect(args['onStatus-change']).not.toHaveBeenCalled()
	},
}

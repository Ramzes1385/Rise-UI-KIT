import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { reviewArgs, reviewModels, reviewTemplate } from '../../reviewShared'

export const Compare: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['mode', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Сравнение версий «Было / Стало / Разница»: `versions` — список версий, `compareWith` — id версии, с которой сравнивается текущая карта (`null` — без сравнения). Здесь включено сравнение с «v14»: полоса над картой переключает слои «Было · v14», «Стало · v15» и «Разница».',
					'«Разница» отмечает добавленное зелёным, убранное красным («призрак» на старом месте), переименованное оранжевым. Вкладка «Версии» перечисляет версии с автором и временем; «Сравнить с текущей» включает сравнение, «Закрыть сравнение» снимает.',
				].join('\n'),
			},
			source: storySource({ template: reviewTemplate, imports: ['BaseFlowMap'], models: reviewModels }),
		},
	},
	args: { ...reviewArgs, compareWith: 'v14' },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { models: reviewModels }),
		template: reviewTemplate,
	}),
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(canvas.getByRole('button', { name: /Закрыть сравнение/ })).toBeVisible())
		await expect(canvas.getByText(/Было · v14/)).toBeVisible()
		await expect(canvas.getByText(/Стало · v15/)).toBeVisible()
		await userEvent.click(canvas.getByText(/Было · v14/))
		await userEvent.click(canvas.getByText('Разница'))
	},
}

import { expect } from 'storybook/test'
import type meta from '../../BaseResult.stories'
import BaseResult from '../../../ui/BaseResult.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { RESULT_STATUSES } from '../../../types/BaseResult.types'

const template = `
	<div class="story-grid" style="--story-grid-min: 280px;">
		<BaseResult v-for="status in RESULT_STATUSES" :key="status" v-bind="args" :status="status" />
	</div>
`

export const Statuses: StoryObj<typeof meta> = {
	args: { title: undefined, description: undefined, variant: 'outline' },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Все семь статусов с текстами по умолчанию из словаря: `success`, `info`, `warning`, `error` — с иконкой роли,',
					'`403` (цвет `warning`), `404` (`info`) и `500` (`error`) — с крупным кодом вместо иконки и описанием.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseResult', 'RESULT_STATUSES'] }),
		},
	},
	render: args => ({
		components: { BaseResult },
		setup: useStorySetup(args, { data: { RESULT_STATUSES } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(RESULT_STATUSES.length)
		await expect(canvas.getByRole('heading', { name: 'Готово' })).toBeVisible()
		await expect(canvas.getByRole('heading', { name: 'Страница не найдена' })).toBeVisible()
		await expect(canvas.getByText('404')).toBeVisible()
		await expect(canvas.getByText('У вас нет прав для просмотра этой страницы.')).toBeVisible()
	},
}

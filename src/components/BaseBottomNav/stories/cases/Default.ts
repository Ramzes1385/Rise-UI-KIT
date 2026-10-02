import { ITEMS } from '../shared'
import { expect, within } from 'storybook/test'
import type meta from '../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBottomNav from '../../ui/BaseBottomNav.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'modelValue' } as const

const template = `
	<div class="story-narrow">
		<BaseBottomNav v-bind="args" v-model="active" />
	</div>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: пункты-кнопки и `v-model`. Выбранный пункт — с подложкой под значком и `aria-current="page"`; у «Избранного» свой значок выбранного пункта (`activeIcon`).',
			},
			source: storySource({ template, imports: ['BaseBottomNav'], models: MODELS }),
		},
	},
	render: args => ({
		components: { BaseBottomNav },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const nav = canvas.getByRole('navigation', { name: 'Нижняя навигация' })
		await expect(within(nav).getAllByRole('listitem')).toHaveLength(ITEMS.length)
		await expect(canvas.getByRole('button', { name: 'Главная' })).toHaveAttribute('aria-current', 'page')

		const search = canvas.getByRole('button', { name: 'Поиск' })
		await userEvent.click(search)
		await expect(search).toHaveAttribute('aria-current', 'page')
		await expect(canvas.getByRole('button', { name: 'Главная' })).not.toHaveAttribute('aria-current')
		await expect(args.onSelect).toHaveBeenCalledWith(ITEMS[1])
	},
}

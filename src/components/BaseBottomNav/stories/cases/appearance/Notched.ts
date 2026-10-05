import { expect } from 'storybook/test'
import { PRIMARY_ITEMS } from '../../shared'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBottomNav from '../../../ui/BaseBottomNav.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'modelValue' } as const

const template = `
	<div class="story-narrow">
		<BaseBottomNav v-bind="args" v-model="active" />
	</div>
`

export const Notched: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`notched` — панель с вырезом под главное действие: пункт с `isPrimary: true` (первый такой) становится круглой кнопкой над вырезом. Подпись остаётся под кнопкой, выбор и `aria-current` — как у обычного пункта. Без `isPrimary` выреза нет; в других вариантах `isPrimary` — обычный пункт.',
			},
			source: storySource({ template, imports: ['BaseBottomNav'], models: MODELS }),
		},
	},
	args: { variant: 'notched', items: PRIMARY_ITEMS },
	render: args => ({
		components: { BaseBottomNav },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const create = canvas.getByRole('button', { name: 'Создать' })
		await expect(create).toHaveClass('base-bottom-nav__link--primary')
		await expect(
			canvas.getAllByRole('button').filter(button => button.classList.contains('base-bottom-nav__link--primary')),
		).toHaveLength(1)

		await userEvent.click(create)
		await expect(create).toHaveAttribute('aria-current', 'page')
		await expect(args.onSelect).toHaveBeenCalledWith(PRIMARY_ITEMS[2])
	},
}

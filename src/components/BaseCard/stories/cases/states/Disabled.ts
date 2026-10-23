import { expect } from 'storybook/test'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { clicks: 0 }

const template = `
	<div class="story-stack story-medium">
		<BaseCard v-bind="args" @click="clicks++" />
		<p class="story-label" role="status">Нажатий: {{ clicks }}</p>
	</div>
`

export const Disabled: StoryObj<typeof meta> = {
	args: { title: 'Тариф «Компания»', subtitle: 'Недоступен на пробном периоде', isDisabled: true },
	parameters: {
		docs: {
			description: {
				story: 'Выключенная кликабельная карточка (`isDisabled`): `aria-disabled="true"`, не получает фокус с Tab, `click` не приходит.',
			},
			source: storySource({ template, imports: ['BaseCard'], state, omit: ['default'] }),
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: useStorySetup(args, { state, slots: ['default'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const card = canvas.getByRole('button', { name: 'Тариф «Компания»' })
		await expect(card).toHaveAttribute('aria-disabled', 'true')
		await expect(card).not.toHaveAttribute('tabindex')
		await userEvent.click(card)
		await expect(canvas.getByRole('status')).toHaveTextContent('Нажатий: 0')
	},
}

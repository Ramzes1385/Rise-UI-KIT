import type meta from '../../BaseTransfer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTransfer from '../../../ui/BaseTransfer.vue'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { value: 'modelValue' }

const template = `<BaseTransfer v-bind="args" v-model="value" is-sortable />`

export const Sortable: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Порядок в «Выбрано» — порядок v-model: строки переставляются мышью за строку или Alt + ↑/↓, новое место объявляется.',
			},
			source: storySource({ template, imports: ['BaseTransfer'], models }),
		},
	},
	args: { modelValue: ['vera', 'anna', 'darya'] },
	render: args => ({
		components: { BaseTransfer },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const target = canvas.getByRole('listbox', { name: 'Выбрано' })
		within(target)
			.getByRole('option', { name: /Вера Ким/ })
			.focus()
		await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
		await waitFor(() =>
			expect(
				within(target)
					.getAllByRole('option')
					.map(option => option.dataset.listId),
			).toEqual(['anna', 'vera', 'darya']),
		)
	},
}

import type meta from '../BaseTransfer.stories'
import BaseTransfer from '../../ui/BaseTransfer.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { inlineKey, storySource, useStorySetup } from '@/stories/helpers'

const models = { value: 'modelValue' }

const template = `<BaseTransfer v-bind="args" v-model="value" />`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: v-model связан с Controls — id из «Выбрано» появляются в панели. Клавиатура: Tab до списка, Space отмечает, Ctrl + → переносит.',
			},
			source: storySource({ template, imports: ['BaseTransfer'], models }),
		},
	},
	render: args => ({
		components: { BaseTransfer },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const source = canvas.getByRole('listbox', { name: 'Доступно' })
		await userEvent.tab()
		await userEvent.tab()
		await expect(within(source).getByRole('option', { name: /Анна Смирнова/ })).toHaveFocus()
		await userEvent.keyboard(' {Control>}' + inlineKey('{ArrowRight}') + '{/Control}')
		const target = canvas.getByRole('listbox', { name: 'Выбрано' })
		await waitFor(() => expect(within(target).getByRole('option', { name: /Анна Смирнова/ })).toBeInTheDocument())
		await expect(within(source).getByRole('option', { name: /Борис Орлов/ })).toHaveFocus()
	},
}

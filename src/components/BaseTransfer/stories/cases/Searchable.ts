import type meta from '../BaseTransfer.stories'
import BaseTransfer from '../../ui/BaseTransfer.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { value: 'modelValue' }

const template = `<BaseTransfer v-bind="args" v-model="value" is-searchable />`

export const Searchable: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Поиск над каждым списком: по `title` и `description` без учёта регистра. «Выбрать все» и перенос касаются только найденных строк.',
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
		const source = canvas.getByRole('group', { name: 'Доступно' })
		await userEvent.type(canvas.getByRole('textbox', { name: 'Поиск: Доступно' }), 'разработ')
		await expect(within(source).getAllByRole('option')).toHaveLength(1)
		await userEvent.click(within(source).getByRole('checkbox', { name: 'Выбрать все' }))
		await userEvent.click(canvas.getByRole('button', { name: 'Перенести отмеченные в «Выбрано»' }))
		const target = canvas.getByRole('listbox', { name: 'Выбрано' })
		await waitFor(() => expect(within(target).getByRole('option', { name: /Егор Белов/ })).toHaveFocus())
	},
}

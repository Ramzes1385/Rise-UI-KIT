import type meta from '../BaseMention.stories'
import { expect, waitFor } from 'storybook/test'
import BaseMention from '../../ui/BaseMention.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { text: 'modelValue' }

const template = `
	<div style="max-width: 560px; min-height: 280px"><BaseMention v-bind="args" v-model="text" /></div>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Наберите @ и начало имени: стрелки выбирают коллегу, Enter вставляет упоминание.' },
			source: storySource({ template, imports: ['BaseMention'], models }),
		},
	},
	render: args => ({
		components: { BaseMention },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('textbox', { name: 'Комментарий' })
		await userEvent.tab()
		await expect(field).toHaveFocus()
		await userEvent.type(field, 'Посмотри, пожалуйста, @ива')
		const list = canvas.getByRole('listbox', { name: 'Упоминания' })
		await expect(list).toHaveTextContent('Иван Петров')
		await userEvent.keyboard('{Enter}')
		await expect(field).toHaveValue('Посмотри, пожалуйста, @ivan ')
		await userEvent.type(field, 'и @')
		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await expect(field).toHaveAttribute('aria-activedescendant', canvas.getAllByRole('option')[2].id)
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByRole('listbox')).toBeNull())
		await userEvent.type(field, ' @xyz')
		await expect(canvas.getByRole('status')).toHaveTextContent('Никого не нашлось')
	},
}

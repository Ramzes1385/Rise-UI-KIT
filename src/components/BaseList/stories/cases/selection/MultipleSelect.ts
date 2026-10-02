import { expect } from 'storybook/test'
import type meta from '../../BaseList.stories'
import BaseList from '../../../ui/BaseList.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { selected: 'modelValue' }

const template = `
	<div class="story-narrow story-stack">
		<BaseList v-bind="args" v-model="selected" />
		<p>Выбрано: {{ selected.length }}</p>
	</div>
`

const isSelected = (option: HTMLElement): boolean => option.getAttribute('aria-selected') === 'true'

export const MultipleSelect: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Множественный выбор (`selection-mode="multiple"`, `aria-multiselectable`): клик, пробел и Enter переключают',
					'строку; Shift+клик и Shift+пробел выбирают диапазон от последней нажатой, Shift+↑/↓ — переход с выбором,',
					'Ctrl/⌘+A — все доступные строки, повторно — снимает выбор. `v-model` — массив id.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseList'], models, types: { selected: 'string[]' } }),
		},
	},
	args: { selectionMode: 'multiple', modelValue: [], label: 'Папки' },
	render: args => ({
		components: { BaseList },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const options = () => canvas.getAllByRole('option')
		await expect(canvas.getByRole('listbox', { name: 'Папки' })).toHaveAttribute('aria-multiselectable', 'true')
		await userEvent.tab()
		await userEvent.keyboard(' ')
		await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}')
		await expect(options().map(isSelected)).toEqual([true, true, true, false])
		await expect(canvas.getByText('Выбрано: 3')).toBeVisible()
		await userEvent.keyboard('{Control>}a{/Control}')
		await expect(options().map(isSelected)).toEqual([false, false, false, false])
		await userEvent.keyboard('{Control>}a{/Control}')
		await expect(options().map(isSelected)).toEqual([true, true, true, false])
		await userEvent.click(options()[1])
		await expect(isSelected(options()[1])).toBe(false)
	},
}

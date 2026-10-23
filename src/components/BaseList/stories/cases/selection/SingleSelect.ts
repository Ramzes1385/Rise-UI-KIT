import { expect } from 'storybook/test'
import type meta from '../../BaseList.stories'
import BaseList from '../../../ui/BaseList.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { section: 'modelValue' }

const template = `
	<div class="story-narrow story-stack">
		<BaseList v-bind="args" v-model="section" />
		<p>Выбрано: {{ section ?? 'ничего' }}</p>
	</div>
`

export const SingleSelect: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Одиночный выбор (`selection-mode="single"`) — listbox по APG: Tab приходит на выбранную строку, ↑/↓, Home и End',
					'переходят, пробел или Enter выбирают. Недоступную строку («Настройки») выбрать нельзя, стрелки её не пропускают.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseList'], models, types: { section: 'string | null' } }),
		},
	},
	args: { modelValue: 'calendar' },
	render: args => ({
		components: { BaseList },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.tab()
		await expect(canvas.getByRole('option', { name: /Календарь/ })).toHaveFocus()
		await userEvent.keyboard('{ArrowDown}')
		const files = canvas.getByRole('option', { name: /Файлы/ })
		await expect(files).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(files).toHaveAttribute('aria-selected', 'true')
		await expect(canvas.getByText('Выбрано: files')).toBeVisible()
		await userEvent.keyboard('{End}')
		const settings = canvas.getByRole('option', { name: /Настройки/ })
		await expect(settings).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(settings).toHaveAttribute('aria-selected', 'false')
		await userEvent.keyboard('{Home}')
		await expect(canvas.getByRole('option', { name: /Входящие/ })).toHaveFocus()
	},
}

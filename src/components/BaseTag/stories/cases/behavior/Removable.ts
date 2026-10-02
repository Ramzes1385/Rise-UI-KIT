import { expect } from 'storybook/test'
import BaseTag from '../../../ui/BaseTag.vue'
import type meta from '../../BaseTag.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { tags: ['Москва', 'Казань', 'Сочи'] }

const template = `
	<div class="story-row">
		<BaseTag v-for="tag in tags" :key="tag" v-bind="args" :label="tag" @remove="tags = tags.filter(item => item !== tag)" />
	</div>
`

export const Removable: StoryObj<typeof meta> = {
	args: { isRemovable: true, isSelectable: false, tone: 'primary' },
	parameters: {
		controls: { include: ['variant', 'tone', 'isSelectable', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Удаляемые метки: кнопка «Удалить метку …» или Delete и Backspace — событие `remove`, метку убирает приложение.',
					'У невыбираемой метки Tab попадает на кнопку удаления; у выбираемой — на саму метку, а Delete и Backspace удаляют её (`aria-keyshortcuts`).',
					'Фокус после удаления в наборе меток переводит `BaseTagGroup`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTag'], state, omit: ['label'] }),
		},
	},
	render: args => ({
		components: { BaseTag },
		setup: useStorySetup(args, { state, slots: ['default'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const remove = canvas.getByRole('button', { name: 'Удалить метку Москва' })
		await tabTo(remove, userEvent)
		await userEvent.keyboard('{Backspace}')
		await expect(canvas.queryByText('Москва')).toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить метку Сочи' }))
		await expect(canvas.queryByText('Сочи')).toBeNull()
		await expect(canvas.getByText('Казань')).toBeVisible()
	},
}

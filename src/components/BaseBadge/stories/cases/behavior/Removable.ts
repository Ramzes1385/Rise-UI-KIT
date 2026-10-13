import { expect } from 'storybook/test'
import type meta from '../../BaseBadge.stories'
import BaseBadge from '../../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { tags: ['Vue', 'TypeScript', 'Storybook'] }

const template = `
	<div class="story-row">
		<BaseBadge
			v-for="tag in tags"
			:key="tag"
			v-bind="args"
			is-removable
			:label="tag"
			@remove="tags.splice(tags.indexOf(tag), 1)" />
		<span class="story-label" role="status">Осталось: {{ tags.length }}</span>
	</div>
`

export const Removable: StoryObj<typeof meta> = {
	args: { variant: 'soft' },
	parameters: {
		controls: { include: ['variant', 'status', 'sizeScale', 'isRemoveFocusable'] },
		docs: {
			description: {
				story: [
					'`isRemovable` — бейдж с кнопкой удаления: событие `remove`, имя кнопки «Удалить {label}» (или `removeLabel`).',
					'Кнопка размером под бейдж, в порядке Tab; `isRemoveFocusable: false` оставляет её вне Tab (для тегов в поле и списке выбора).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseBadge'], state, omit: ['default', 'label'] }),
		},
	},
	render: args => ({
		components: { BaseBadge },
		setup: useStorySetup(args, { state, slots: ['default', 'label'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const button = canvas.getByRole('button', { name: 'Удалить TypeScript' })
		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('status')).toHaveTextContent('Осталось: 2')
		await expect(canvas.queryByText('TypeScript')).toBeNull()
	},
}

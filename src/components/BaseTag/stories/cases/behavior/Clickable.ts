import { expect } from 'storybook/test'
import BaseTag from '../../../ui/BaseTag.vue'
import type meta from '../../BaseTag.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { clicks: 0 }

const template = `
	<div class="story-row">
		<BaseTag v-bind="args" label="Показать похожие" @click="clicks++" />
		<span class="story-label" role="status">Нажатий: {{ clicks }}</span>
	</div>
`

export const Clickable: StoryObj<typeof meta> = {
	args: { isSelectable: false },
	parameters: {
		controls: { include: ['variant', 'tone', 'sizeScale'] },
		docs: {
			description: {
				story: 'Кликабельная метка без выбора: с обработчиком `@click` она работает как кнопка (`useClickable`) — `role="button"`, Tab, Enter и Space вызывают тот же `click`.',
			},
			source: storySource({ template, imports: ['BaseTag'], state, omit: ['label', 'isSelectable'] }),
		},
	},
	render: args => ({
		components: { BaseTag },
		setup: useStorySetup(args, { state, slots: ['default'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const tag = canvas.getByRole('button', { name: 'Показать похожие' })
		await tabTo(tag, userEvent)
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await expect(canvas.getByRole('status')).toHaveTextContent('Нажатий: 2')
	},
}

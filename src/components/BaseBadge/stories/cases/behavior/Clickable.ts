import { expect } from 'storybook/test'
import type meta from '../../BaseBadge.stories'
import BaseBadge from '../../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { clicks: 0 }

const template = `
	<div class="story-row">
		<BaseBadge v-bind="args" label="Только новые" @click="clicks++" />
		<span class="story-label" role="status">Нажатий: {{ clicks }}</span>
	</div>
`

export const Clickable: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Кликабельный бейдж: с обработчиком `@click` он работает как кнопка — `role="button"`, фокус с Tab и кольцо фокуса.',
					'Enter и Space вызывают тот же `click`. Без обработчика бейдж остаётся текстом: без роли и фокуса.',
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
		const badge = canvas.getByRole('button', { name: 'Только новые' })
		await tabTo(badge, userEvent)
		await expect(getComputedStyle(badge).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await expect(canvas.getByRole('status')).toHaveTextContent('Нажатий: 2')
	},
}

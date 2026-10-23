import { expect } from 'storybook/test'
import type meta from '../../BaseBadge.stories'
import BaseBadge from '../../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { clicks: 0 }

const template = `
	<div class="story-row">
		<BaseBadge v-bind="args" label="Архив" @click="clicks++" />
		<span class="story-label" role="status">Нажатий: {{ clicks }}</span>
	</div>
`

export const Disabled: StoryObj<typeof meta> = {
	args: { isDisabled: true },
	parameters: {
		controls: { include: ['variant', 'isDisabled', 'sizeScale'] },
		docs: {
			description: {
				story: 'Выключенный кликабельный бейдж (`isDisabled`): `aria-disabled="true"`, не получает фокус с Tab, `click` не приходит.',
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
		const badge = canvas.getByRole('button', { name: 'Архив' })
		await expect(badge).toHaveAttribute('aria-disabled', 'true')
		await expect(badge).not.toHaveAttribute('tabindex')
		await userEvent.click(badge)
		await expect(canvas.getByRole('status')).toHaveTextContent('Нажатий: 0')
	},
}

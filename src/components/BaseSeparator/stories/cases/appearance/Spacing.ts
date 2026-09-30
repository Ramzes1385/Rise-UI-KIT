import { expect } from 'storybook/test'
import type meta from '../../BaseSeparator.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSeparator from '../../../ui/BaseSeparator.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">по умолчанию</span>
			<BaseSeparator v-bind="args" />
		</div>
		<div class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">spacing 4</span>
			<BaseSeparator v-bind="args" :spacing="4" />
		</div>
		<div class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">spacing 16</span>
			<BaseSeparator v-bind="args" :spacing="16" />
		</div>
	</div>
`

export const Spacing: StoryObj<typeof meta> = {
	args: { label: 'или' },
	parameters: {
		controls: { include: ['orientation', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Отступы подписи `spacing` (px): вдоль линии — значение × 2, поперёк — значение.',
					'Без пропа — 12px вдоль линии и 0 поперёк: разделитель с подписью не выше строки текста.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSeparator'], omit: ['default', 'spacing'] }),
		},
	},
	render: args => ({
		components: { BaseSeparator },
		setup: useStorySetup(args, { slots: ['default', 'spacing'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const [themed, compact] = canvas.getAllByText('или')
		await expect(getComputedStyle(themed).paddingLeft).toBe('12px')
		await expect(getComputedStyle(compact).paddingLeft).toBe('8px')
	},
}

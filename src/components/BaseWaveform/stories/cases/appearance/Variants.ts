import type meta from '../../BaseWaveform.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseWaveform from '../../../ui/BaseWaveform.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-col" style="gap: 16px; max-width: 420px;">
		<BaseWaveform v-bind="args" variant="default" label="default" />
		<BaseWaveform v-bind="args" variant="soft" label="soft" />
		<div style="padding: 8px 12px; border-radius: 12px; background: var(--rise-primary); color: var(--rise-on-primary);">
			<BaseWaveform v-bind="args" variant="soft" label="soft в пузыре сообщения" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'default — сыгранная часть цветом primary; soft — оттенки цвета текста: подходит для пузыря сообщения любого цвета.',
			},
			source: storySource({ template, imports: ['BaseWaveform'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseWaveform },
		setup: useStorySetup(args),
		template,
	}),
}

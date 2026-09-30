import type meta from '../../BaseProgress.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseProgress from '../../../ui/BaseProgress.vue'
import { PROGRESS_ANIMATIONS } from '../../../types/BaseProgress.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const animations = PROGRESS_ANIMATIONS

const template = `
	<div class="story-stack">
		<div v-for="animation in animations" :key="animation" class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">{{ animation }}</span>
			<BaseProgress v-bind="args" :animation="animation" :aria-label="animation" />
		</div>
	</div>
`

export const Animations: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['value', 'sizeScale', 'color'] },
		docs: {
			description: { story: 'Оформление заливки `animation`: `striped` — полосы, `pulse` — мерцание, `glow` — свечение.' },
			source: storySource({
				template,
				imports: ['BaseProgress'],
				script: `const animations = ${literal(animations)}`,
				omit: ['default', 'animation', 'shape'],
			}),
		},
	},
	render: args => ({
		components: { BaseProgress },
		setup: useStorySetup(args, { data: { animations }, slots: ['default', 'animation', 'shape'] }),
		template,
	}),
}

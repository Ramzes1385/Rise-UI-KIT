import type meta from '../../BaseProgress.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseProgress from '../../../ui/BaseProgress.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { PROGRESS_ANIMATIONS } from '../../../types/BaseProgress.types'

export const Animations: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['value', 'sizeScale', 'color'] },
		docs: {
			description: { story: 'Оформление заливки `animation`: `striped` — полосы, `pulse` — мерцание, `glow` — свечение.' },
			source: { code: PROGRESS_ANIMATIONS.map(animation => `<BaseProgress :value="60" animation="${animation}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseProgress },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'animation', 'shape']), animations: PROGRESS_ANIMATIONS }),
		template: `
			<div class="story-stack">
				<div v-for="animation in animations" :key="animation" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ animation }}</span>
					<BaseProgress v-bind="props" :animation="animation" :aria-label="animation" />
				</div>
			</div>
		`,
	}),
}

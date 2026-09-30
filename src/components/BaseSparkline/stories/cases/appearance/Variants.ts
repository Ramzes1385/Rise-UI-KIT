import type meta from '../../BaseSparkline.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseSparkline from '../../../ui/BaseSparkline.vue'
import { SPARKLINE_VARIANTS } from '../../../types/BaseSparkline.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Линия, линия с заливкой и столбики на одних данных.' } },
		controls: { include: ['height', 'markColor'] },
	},
	render: args => ({
		components: { BaseSparkline },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: SPARKLINE_VARIANTS }),
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px; padding-top: 40px">
				<div v-for="variant in variants" :key="variant" style="display: flex; flex-direction: column; gap: 8px">
					<span style="font-size: 12px; color: var(--rise-text-muted)">{{ variant }}</span>
					<BaseSparkline v-bind="props" :variant="variant" />
				</div>
			</div>`,
	}),
}

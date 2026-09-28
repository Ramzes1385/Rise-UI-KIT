import type meta from '../BaseSeparator.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSeparator from '../../ui/BaseSeparator.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Thickness: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['isDashed', 'color'] },
		docs: {
			description: { story: 'Толщина линии `thickness` в пикселях: 1 — по умолчанию, 2–4 — для акцентных границ разделов.' },
			source: { code: [1, 2, 4].map(thickness => `<BaseSeparator :thickness="${thickness}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseSeparator },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label', 'thickness']), thicknesses: [1, 2, 4] }),
		template: `
			<div class="story-stack">
				<div v-for="thickness in thicknesses" :key="thickness" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ thickness }}px</span>
					<BaseSeparator v-bind="props" :thickness="thickness" />
				</div>
			</div>
		`,
	}),
}

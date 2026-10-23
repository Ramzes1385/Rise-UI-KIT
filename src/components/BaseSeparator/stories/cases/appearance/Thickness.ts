import type meta from '../../BaseSeparator.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSeparator from '../../../ui/BaseSeparator.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const thicknesses = [1, 2, 4]

const template = `
	<div class="story-stack">
		<div v-for="thickness in thicknesses" :key="thickness" class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">{{ thickness }}px</span>
			<BaseSeparator v-bind="args" :thickness="thickness" />
		</div>
	</div>
`

export const Thickness: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['isDashed', 'color'] },
		docs: {
			description: { story: 'Толщина линии `thickness` в пикселях: 1 — по умолчанию, 2–4 — для акцентных границ разделов.' },
			source: storySource({
				template,
				imports: ['BaseSeparator'],
				script: `const thicknesses = ${literal(thicknesses)}`,
				omit: ['default', 'label', 'thickness'],
			}),
		},
	},
	render: args => ({
		components: { BaseSeparator },
		setup: useStorySetup(args, { data: { thicknesses }, slots: ['default', 'label', 'thickness'] }),
		template,
	}),
}

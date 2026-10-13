import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCookieConsent.stories'
import BaseCookieConsent from '../../../ui/BaseCookieConsent.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name">
			<span class="story-label">{{ preset.label }}</span>
			<div class="story-frame" style="height: 260px; background: var(--rise-bg-muted)">
				<BaseCookieConsent v-bind="args" :size-scale="preset.sizeScale" />
			</div>
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'position'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125. Масштабируются отступы, тексты, кнопки и ширина окна.',
			},
			source: storySource({ template, imports: ['BaseCookieConsent'], script: `const presets = ${literal(presets)}` }),
		},
	},
	render: args => ({
		components: { BaseCookieConsent },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
	play: async ({ canvas }) => {
		const heights = canvas.getAllByRole('region').map(dialog => dialog.getBoundingClientRect().height)
		await expect(heights).toHaveLength(presets.length)
		await expect(heights[0]).toBeLessThan(heights[heights.length - 1])
	},
}

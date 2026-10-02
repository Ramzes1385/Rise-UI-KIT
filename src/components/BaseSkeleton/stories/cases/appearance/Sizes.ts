import type meta from '../../BaseSkeleton.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSkeleton from '../../../ui/BaseSkeleton.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name" class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">{{ preset.label }}</span>
			<BaseSkeleton v-bind="args" shape="circle" :width="32" :height="32" :size-scale="preset.sizeScale" />
			<BaseSkeleton v-bind="args" shape="text" :width="160" :size-scale="preset.sizeScale" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['isAnimated', 'isPulse'] },
		docs: {
			description: { story: 'Размеры задаются `sizeScale`: он масштабирует `width`/`height`, высоту строки `text` и скругления.' },
			source: storySource({
				template,
				imports: ['BaseSkeleton'],
				script: `const presets = ${literal(presets)}`,
				omit: ['default', 'shape', 'width', 'height', 'sizeScale'],
			}),
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: useStorySetup(args, { data: { presets }, slots: ['default', 'shape', 'width', 'height', 'sizeScale'] }),
		template,
	}),
}

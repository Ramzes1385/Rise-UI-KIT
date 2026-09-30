import type meta from '../../BaseTree.stories'
import BaseTree from '../../../ui/BaseTree.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)).map(preset => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	label: sizeLabel(preset),
}))

const hidden = ['sizeScale', 'expandedIds', 'selectedIds']

const template = `
	<div class="story-grid" style="--story-grid-min: 260px;">
		<div v-for="preset in presets" :key="preset.name" class="story-stack" style="gap: 8px;">
			<span class="story-label">{{ preset.label }}</span>
			<BaseTree v-bind="args" :size-scale="preset.sizeScale" :expanded-ids="['src', 'composables']" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'arrowPosition'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: высота строки 24, 32 и 40px, отступ уровня и иконки масштабируются вместе с текстом.',
			},
			source: storySource({ template, imports: ['BaseTree'], script: `const presets = ${literal(presets)}`, omit: hidden }),
		},
	},
	render: args => ({
		components: { BaseTree },
		setup: useStorySetup(args, { data: { presets }, slots: hidden }),
		template,
	}),
}

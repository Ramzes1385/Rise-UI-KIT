import { OFFICES } from '../../shared'
import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-grid" style="--story-grid-min: 260px">
		<BaseMap v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :aria-label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: '`sizeScale` меняет заглушку, индикатор загрузки и метки (с ключом из `.env.local` — на живой карте); высоту карты задаёт `height`.',
			},
			source: storySource({ template, imports: ['BaseMap'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant', 'height'] },
	},
	args: { height: '220px', zoom: 12, markers: OFFICES.slice(0, 2) },
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}

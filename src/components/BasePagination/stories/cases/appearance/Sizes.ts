import { MODEL_KEYS } from '../../shared'
import type meta from '../../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePagination from '../../../ui/BasePagination.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { pages: Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 5])) }

const hidden = [...MODEL_KEYS, 'sizeScale']

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name" class="story-col">
			<span class="story-label">{{ preset.label }}</span>
			<BasePagination v-bind="args" v-model="pages[preset.name]" :size-scale="preset.sizeScale" :aria-label="'Пагинация ' + preset.label" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: кнопки 24, 28, 32, 36 и 40px — как у BaseButton того же размера.' },
			source: storySource({
				template,
				imports: ['BasePagination'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { pages: 'Record<string, number>' },
				omit: hidden,
			}),
		},
	},
	render: args => ({
		components: { BasePagination },
		setup: useStorySetup(args, { state, data: { presets }, slots: hidden }),
		template,
	}),
}

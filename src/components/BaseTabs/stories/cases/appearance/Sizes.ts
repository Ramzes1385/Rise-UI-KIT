import { MODEL_KEYS } from '../../shared'
import type meta from '../../BaseTabs.stories'
import BaseTabs from '../../../ui/BaseTabs.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { tabs: Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 'overview'])) }

const hidden = [...MODEL_KEYS, 'sizeScale', 'default']

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name" class="story-col">
			<span class="story-label">{{ preset.label }}</span>
			<BaseTabs v-bind="args" v-model="tabs[preset.name]" :size-scale="preset.sizeScale" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	args: { variant: 'pills' },
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: высота вкладки 24, 28, 32, 36 и 40px — как у кнопки того же размера.' },
			source: storySource({
				template,
				imports: ['BaseTabs'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { tabs: 'Record<string, string>' },
				omit: hidden,
			}),
		},
	},
	render: args => ({
		components: { BaseTabs },
		setup: useStorySetup(args, { state, data: { presets }, slots: hidden }),
		template,
	}),
}

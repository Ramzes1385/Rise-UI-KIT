import type meta from '../../BasePhoneInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePhoneInput from '../../../ui/BasePhoneInput.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const sizes = SIZE_PRESETS.map(preset => ({ sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div style="display: flex; flex-direction: column; gap: 16px; max-width: 360px">
		<BasePhoneInput v-for="size in sizes" :key="size.sizeScale" v-bind="args" :size-scale="size.sizeScale" :label="size.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({
				template,
				imports: ['BasePhoneInput'],
				script: `const sizes = ${literal(sizes)}`,
				omit: ['sizeScale', 'label'],
			}),
		},
		controls: { include: ['variant'] },
	},
	args: { modelValue: '+79161234567' },
	render: args => ({
		components: { BasePhoneInput },
		setup: useStorySetup(args, { data: { sizes } }),
		template,
	}),
}

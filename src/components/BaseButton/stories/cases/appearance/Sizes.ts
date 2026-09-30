import type meta from '../../BaseButton.stories'
import BaseButton from '../../../ui/BaseButton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const sizes = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, caption: sizeLabel(preset) }))

const template = `
	<div class="story-row" style="align-items: flex-end;">
		<BaseButton v-for="size in sizes" :key="size.name" v-bind="args" :size-scale="size.sizeScale">
			{{ size.caption }}
		</BaseButton>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			description: { story: 'Размеры задаются `sizeScale`. Пресеты соответствуют шкале xs–xl: высота кнопки 24, 28, 32, 36 и 40px.' },
			source: storySource({ template, imports: ['BaseButton'], script: `const sizes = ${literal(sizes)}`, omit: ['sizeScale'] }),
		},
	},
	render: args => ({
		components: { BaseButton },
		setup: useStorySetup(args, { data: { sizes } }),
		template,
	}),
}
